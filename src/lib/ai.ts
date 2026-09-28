import { ChannelKey, Launch, LaunchContent } from "./types";

/**
 * Free-tier OpenRouter models, tried in order. Shared free pools get
 * rate-limited unpredictably, so we fall through the list before giving
 * up and using the deterministic template — the app never blocks on this.
 */
const FREE_MODELS = [
  "nvidia/nemotron-3-super-120b-a12b:free",
  "qwen/qwen3.8-27b:free",
  "google/gemma-4-31b-it:free",
];

const REQUEST_TIMEOUT_MS = 8000;

async function callOpenRouter(system: string, user: string): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  for (const model of FREE_MODELS) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          reasoning: { enabled: false },
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          max_tokens: 600,
          temperature: 0.7,
        }),
        signal: controller.signal,
      });
      if (!res.ok) continue;
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;
      if (typeof text === "string" && text.trim()) return text.trim();
    } catch {
      // try the next model
    } finally {
      clearTimeout(timeout);
    }
  }
  return null;
}

/**
 * Free models occasionally nest fields in the wrong place (e.g. putting
 * "whatsapp" inside "email"). Rather than fail on that, walk the whole
 * parsed object looking for channel keys wherever they landed.
 */
function extractChannelContent(raw: unknown): LaunchContent {
  const content: LaunchContent = {};

  function visit(node: unknown) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
      if (key === "email" && !content.email && value && typeof value === "object") {
        const v = value as Record<string, unknown>;
        if (typeof v.subject === "string" || typeof v.body === "string") {
          content.email = {
            to: typeof v.to === "string" ? v.to : "",
            subject: typeof v.subject === "string" ? v.subject : "",
            body: typeof v.body === "string" ? v.body : "",
          };
        }
      } else if (key === "whatsapp" && !content.whatsapp) {
        if (typeof value === "string") {
          content.whatsapp = { message: value.replace(/^message:\s*/i, "") };
        } else if (value && typeof value === "object" && typeof (value as { message?: unknown }).message === "string") {
          content.whatsapp = { message: (value as { message: string }).message };
        }
      } else if (key === "social" && !content.social) {
        if (typeof value === "string") {
          content.social = { caption: value };
        } else if (value && typeof value === "object" && typeof (value as { caption?: unknown }).caption === "string") {
          content.social = { caption: (value as { caption: string }).caption };
        }
      }
      if (value && typeof value === "object") visit(value);
    }
  }

  visit(raw);
  return content;
}

function templateFor(channel: ChannelKey, brief: string): LaunchContent[keyof LaunchContent] {
  const headline = brief.trim().split(/[.\n]/)[0] || "New campaign";
  if (channel === "email") return { to: "", subject: headline, body: `${brief.trim()}\n\n— The team` };
  if (channel === "whatsapp") return { message: `${headline}. ${brief.trim()} Reply STOP to unsubscribe.` };
  return { caption: `${headline} 👀 ${brief.trim()}` };
}

function templateDraft(brief: string, channels: ChannelKey[]): LaunchContent {
  const content: LaunchContent = {};
  for (const channel of channels) {
    (content as Record<string, unknown>)[channel] = templateFor(channel, brief);
  }
  return content;
}

/**
 * Drafts per-channel content from a short brief. Tries a free OpenRouter
 * model if OPENROUTER_API_KEY is set; fills in a deterministic template for
 * any channel the model didn't return (or all of them, with no key set),
 * so the feature always works even with zero setup.
 */
export async function draftContent(brief: string, channels: ChannelKey[]): Promise<LaunchContent> {
  const raw = await callOpenRouter(
    `You write concise marketing campaign copy. Given a brief and a list of channels, ` +
      `return ONLY a JSON object (no markdown fences, no explanation) with this exact top-level shape: ` +
      `{"email": {"subject": string, "body": string}, "whatsapp": {"message": string}, "social": {"caption": string}}. ` +
      `Only include keys for channels in the requested list: ${channels.join(", ")}. ` +
      `Every WhatsApp message must include an opt-out instruction like "Reply STOP to unsubscribe". ` +
      `Keep body/caption/message under 300 characters. Do not nest one channel's fields inside another's.`,
    brief
  );

  let aiContent: LaunchContent = {};
  if (raw) {
    try {
      const jsonText = raw.replace(/^```json\s*|```$/gi, "").trim();
      aiContent = extractChannelContent(JSON.parse(jsonText));
    } catch {
      aiContent = {};
    }
  }

  const templated = templateDraft(brief, channels);
  const merged: LaunchContent = { ...templated };
  for (const channel of channels) {
    const fromAi = (aiContent as Record<string, unknown>)[channel];
    if (fromAi) (merged as Record<string, unknown>)[channel] = fromAi;
  }
  return merged;
}

/**
 * Answers a free-text question about one launch's status. Same pattern:
 * real model call if a key is configured, deterministic fallback otherwise.
 */
export async function answerLaunchQuestion(launch: Launch, question: string): Promise<string> {
  const summary = launch.channels
    .map(
      (c) =>
        `${c}: ${launch.channelStatus[c].state}${
          launch.channelStatus[c].detail ? ` (${launch.channelStatus[c].detail})` : ""
        }`
    )
    .join("; ");

  const answer = await callOpenRouter(
    `You are a terse assistant answering questions about the status of one marketing campaign launch. ` +
      `Answer in 1-2 plain sentences using only the data given, no markdown. Data: ${summary}`,
    question
  );
  if (answer) return answer.replace(/^```\s*|```$/g, "").trim();

  return fallbackAnswer(launch, question);
}

function fallbackAnswer(launch: Launch, question: string): string {
  const q = question.toLowerCase();
  const failed = launch.channels.filter((c) => launch.channelStatus[c].state === "failed");
  const live = launch.channels.filter((c) => launch.channelStatus[c].state === "live");
  const pending = launch.channels.filter(
    (c) => launch.channelStatus[c].state === "pending" || launch.channelStatus[c].state === "scheduled"
  );

  if (q.includes("fail")) {
    return failed.length
      ? `${failed.join(", ")} failed. ${failed
          .map((c) => launch.channelStatus[c].detail)
          .filter(Boolean)
          .join(" ")}`
      : "No channels have failed.";
  }
  if (q.includes("live") || q.includes("status") || q.includes("done")) {
    return (
      `${live.length}/${launch.channels.length} channels are live.` +
      (pending.length ? ` ${pending.join(", ")} still in progress.` : "")
    );
  }
  if (q.includes("channel")) {
    return `This launch targets: ${launch.channels.join(", ")}.`;
  }
  return `${live.length}/${launch.channels.length} live, ${failed.length} failed, ${pending.length} in progress. Ask me about "status", "failed", or "channels".`;
}
