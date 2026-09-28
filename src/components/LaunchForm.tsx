"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChannelKey, CHANNEL_LABELS, Launch } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Field";
import { CHANNEL_ICONS, SparklesIcon } from "@/components/ui/Icons";

const ALL_CHANNELS: ChannelKey[] = ["email", "whatsapp", "social"];

interface FormState {
  name: string;
  channels: ChannelKey[];
  emailTo: string;
  emailSubject: string;
  emailBody: string;
  whatsappMessage: string;
  socialCaption: string;
  offsetEmail: number;
  offsetWhatsapp: number;
  offsetSocial: number;
  when: "now" | "later";
  scheduledFor: string;
}

function initialStateFrom(launch?: Launch): FormState {
  return {
    name: launch?.name ?? "",
    channels: launch?.channels ?? ["email", "whatsapp", "social"],
    emailTo: launch?.content.email?.to ?? "",
    emailSubject: launch?.content.email?.subject ?? "",
    emailBody: launch?.content.email?.body ?? "",
    whatsappMessage: launch?.content.whatsapp?.message ?? "",
    socialCaption: launch?.content.social?.caption ?? "",
    offsetEmail: launch?.offsets.email ?? 0,
    offsetWhatsapp: launch?.offsets.whatsapp ?? 0,
    offsetSocial: launch?.offsets.social ?? 0,
    when: launch?.scheduledFor ? "later" : "now",
    scheduledFor: launch?.scheduledFor ? launch.scheduledFor.slice(0, 16) : "",
  };
}

export function LaunchForm({ launch }: { launch?: Launch }) {
  const router = useRouter();
  const [state, setState] = useState<FormState>(initialStateFrom(launch));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [brief, setBrief] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [draftNote, setDraftNote] = useState<string | null>(null);

  async function draftWithAi() {
    if (!brief.trim()) {
      setDraftNote("Write a one-line brief first.");
      return;
    }
    if (state.channels.length === 0) {
      setDraftNote("Select at least one channel first.");
      return;
    }
    setDrafting(true);
    setDraftNote(null);
    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief, channels: state.channels }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDraftNote(data.error ?? "Could not draft content.");
        return;
      }
      setState((s) => ({
        ...s,
        emailSubject: data.content.email?.subject ?? s.emailSubject,
        emailBody: data.content.email?.body ?? s.emailBody,
        whatsappMessage: data.content.whatsapp?.message ?? s.whatsappMessage,
        socialCaption: data.content.social?.caption ?? s.socialCaption,
      }));
      setDraftNote(
        data.usedRealAi
          ? "Drafted with AI — review before launching."
          : "Drafted from a template (no OPENROUTER_API_KEY set, or the free model was unavailable) — review before launching."
      );
    } catch {
      setDraftNote("Could not reach the server.");
    } finally {
      setDrafting(false);
    }
  }
  const isEdit = Boolean(launch);

  function toggleChannel(channel: ChannelKey) {
    setState((s) => ({
      ...s,
      channels: s.channels.includes(channel)
        ? s.channels.filter((c) => c !== channel)
        : [...s.channels, channel],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!state.name.trim()) {
      setError("Give this launch a name.");
      return;
    }
    if (state.channels.length === 0) {
      setError("Select at least one channel.");
      return;
    }

    const payload = {
      name: state.name,
      channels: state.channels,
      content: {
        email: state.channels.includes("email")
          ? { to: state.emailTo, subject: state.emailSubject, body: state.emailBody }
          : undefined,
        whatsapp: state.channels.includes("whatsapp") ? { message: state.whatsappMessage } : undefined,
        social: state.channels.includes("social") ? { caption: state.socialCaption } : undefined,
      },
      offsets: {
        email: state.offsetEmail,
        whatsapp: state.offsetWhatsapp,
        social: state.offsetSocial,
      },
      scheduledFor:
        state.when === "later" && state.scheduledFor ? new Date(state.scheduledFor).toISOString() : null,
    };

    setSubmitting(true);
    try {
      const res = await fetch(isEdit ? `/api/launches/${launch!.id}` : "/api/launches", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setSubmitting(false);
        return;
      }
      router.push(`/launches/${data.launch.id}`);
      router.refresh();
    } catch {
      setError("Could not reach the server. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label>Launch name</Label>
        <Input
          type="text"
          value={state.name}
          onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))}
          placeholder="e.g. Spring Collection Launch"
        />
      </div>

      <div>
        <Label>Channels</Label>
        <div className="flex gap-2">
          {ALL_CHANNELS.map((key) => {
            const active = state.channels.includes(key);
            const Icon = CHANNEL_ICONS[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleChannel(key)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {CHANNEL_LABELS[key]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg border border-indigo-100 bg-gradient-to-br from-indigo-50/70 to-violet-50/40 p-4">
        <Label className="mb-1">
          Draft content from a brief <span className="font-normal text-slate-400">(optional)</span>
        </Label>
        <div className="flex gap-2">
          <Input
            type="text"
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="e.g. Spring collection is live, 20% off for the first week"
            className="bg-white"
          />
          <Button type="button" onClick={draftWithAi} disabled={drafting} className="whitespace-nowrap">
            <SparklesIcon className="h-4 w-4" />
            {drafting ? "Drafting…" : "Draft with AI"}
          </Button>
        </div>
        {draftNote && <p className="mt-2 text-xs text-slate-500">{draftNote}</p>}
      </div>

      {state.channels.includes("email") && (
        <ChannelSection title="Email" channel="email">
          <Input
            type="email"
            placeholder="Recipient (e.g. customers@example.com)"
            value={state.emailTo}
            onChange={(e) => setState((s) => ({ ...s, emailTo: e.target.value }))}
          />
          <Input
            type="text"
            placeholder="Subject"
            value={state.emailSubject}
            onChange={(e) => setState((s) => ({ ...s, emailSubject: e.target.value }))}
          />
          <Textarea
            placeholder="Body"
            value={state.emailBody}
            onChange={(e) => setState((s) => ({ ...s, emailBody: e.target.value }))}
            rows={3}
          />
          <OffsetInput
            label="Send offset (minutes from launch time)"
            value={state.offsetEmail}
            onChange={(v) => setState((s) => ({ ...s, offsetEmail: v }))}
          />
        </ChannelSection>
      )}

      {state.channels.includes("whatsapp") && (
        <ChannelSection title="WhatsApp" channel="whatsapp">
          <Textarea
            placeholder="Message"
            value={state.whatsappMessage}
            onChange={(e) => setState((s) => ({ ...s, whatsappMessage: e.target.value }))}
            rows={3}
          />
          <OffsetInput
            label="Send offset (minutes from launch time)"
            value={state.offsetWhatsapp}
            onChange={(v) => setState((s) => ({ ...s, offsetWhatsapp: v }))}
          />
        </ChannelSection>
      )}

      {state.channels.includes("social") && (
        <ChannelSection title="Social" channel="social">
          <Textarea
            placeholder="Caption"
            value={state.socialCaption}
            onChange={(e) => setState((s) => ({ ...s, socialCaption: e.target.value }))}
            rows={3}
          />
          <OffsetInput
            label="Post offset (minutes from launch time)"
            value={state.offsetSocial}
            onChange={(v) => setState((s) => ({ ...s, offsetSocial: v }))}
          />
        </ChannelSection>
      )}

      <div>
        <Label>When</Label>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex rounded-md border border-slate-200 bg-slate-100 p-0.5">
            {(["now", "later"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setState((s) => ({ ...s, when: opt }))}
                className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                  state.when === opt ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {opt === "now" ? "Launch now" : "Schedule for later"}
              </button>
            ))}
          </div>
          {state.when === "later" && (
            <input
              type="datetime-local"
              value={state.scheduledFor}
              onChange={(e) => setState((s) => ({ ...s, scheduledFor: e.target.value }))}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
          )}
        </div>
      </div>

      {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving…" : isEdit ? "Save & re-check" : "Create Launch"}
      </Button>
    </form>
  );
}

function ChannelSection({
  title,
  channel,
  children,
}: {
  title: string;
  channel: ChannelKey;
  children: React.ReactNode;
}) {
  const Icon = CHANNEL_ICONS[channel];
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <p className="mb-3 flex items-center gap-1.5 text-sm font-medium text-slate-700">
        <Icon className="h-4 w-4 text-slate-400" /> {title}
      </p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function OffsetInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-slate-500">
      {label}
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-900"
      />
    </label>
  );
}
