import { ChannelKey, Launch, LaunchContent } from "./types";

const MODEL = "claude-haiku-4-5-20251001";

async function callClaude(system: string, user: string): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 512,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data?.content?.[0]?.text;
    return typeof text === "string" ? text : null;
  } catch {
    return null;
  }
}

/**
 * Drafts per-channel content from a short brief. Uses a real Claude call if
 * ANTHROPIC_API_KEY is set (this is the one place in the app that costs
 * money, opt-in only); otherwise falls back to a deterministic template so
 * the feature still works with zero setup and zero cost.
 */
export async function draftContent(
  brief: string,
  channels: ChannelKey[]
): Promise<LaunchContent> {
  const raw = await callClaude(
    `You write concise marketing campaign copy. Given a brief and a list of channels, ` +
      `return ONLY a JSON object (no markdown fences) with this shape: ` +
      `{"email"?: {"subject": string, "body": string}, "whatsapp"?: {"message": string}, "social"?: {"caption": string}}. ` +
      `Include a key only for channels in the requested list: ${channels.join(", ")}. ` +
      `WhatsApp messages must include an opt-out instruction like "Reply STOP to unsubscribe". ` +
      `Keep body/caption/message under 400 characters.`,
    brief
  );

  if (raw) {
    try {
      const jsonText = raw.trim().replace(/^```json\s*|```$/g, "");
      const parsed = JSON.parse(jsonText);
      return parsed as LaunchContent;
    } catch {
      // fall through to template
    }
  }

  return templateDraft(brief, channels);
}

function templateDraft(brief: string, channels: ChannelKey[]): LaunchContent {
  const headline = brief.trim().split(/[.\n]/)[0] || "New campaign";
  const content: LaunchContent = {};

  if (channels.includes("email")) {
    content.email = {
      to: "",
      subject: headline,
      body: `${brief.trim()}\n\n— The team`,
    };
  }
  if (channels.includes("whatsapp")) {
    content.whatsapp = {
      message: `${headline}. ${brief.trim()} Reply STOP to unsubscribe.`,
    };
  }
  if (channels.includes("social")) {
    content.social = {
      caption: `${headline} 👀 ${brief.trim()}`,
    };
  }
  return content;
}

/**
 * Answers a free-text question about one launch's status. Same pattern:
 * real Claude call if a key is configured, deterministic fallback otherwise.
 */
export async function answerLaunchQuestion(launch: Launch, question: string): Promise<string> {
  const summary = launch.channels
    .map((c) => `${c}: ${launch.channelStatus[c].state}${launch.channelStatus[c].detail ? ` (${launch.channelStatus[c].detail})` : ""}`)
    .join("; ");

  const answer = await callClaude(
    `You are a terse assistant answering questions about the status of one marketing campaign launch. ` +
      `Answer in 1-2 sentences using only the data given. Data: ${summary}`,
    question
  );
  if (answer) return answer.trim();

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
    return `${live.length}/${launch.channels.length} channels are live.` +
      (pending.length ? ` ${pending.join(", ")} still in progress.` : "");
  }
  if (q.includes("channel")) {
    return `This launch targets: ${launch.channels.join(", ")}.`;
  }
  return `${live.length}/${launch.channels.length} live, ${failed.length} failed, ${pending.length} in progress. Ask me about "status", "failed", or "channels".`;
}
