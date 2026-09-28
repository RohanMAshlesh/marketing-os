"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChannelKey, CHANNEL_LABELS, Launch } from "@/lib/types";

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
        <label className="block text-sm font-medium text-slate-700">Launch name</label>
        <input
          type="text"
          value={state.name}
          onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))}
          placeholder="e.g. Spring Collection Launch"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Channels</label>
        <div className="mt-2 flex gap-3">
          {ALL_CHANNELS.map((channel) => (
            <label
              key={channel}
              className={`cursor-pointer rounded-md border px-3 py-2 text-sm ${
                state.channels.includes(channel)
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-slate-300 text-slate-600"
              }`}
            >
              <input
                type="checkbox"
                checked={state.channels.includes(channel)}
                onChange={() => toggleChannel(channel)}
                className="mr-2"
              />
              {CHANNEL_LABELS[channel]}
            </label>
          ))}
        </div>
      </div>

      {state.channels.includes("email") && (
        <fieldset className="rounded-md border border-slate-200 p-4">
          <legend className="px-1 text-sm font-medium text-slate-700">Email</legend>
          <div className="space-y-3">
            <input
              type="email"
              placeholder="Recipient (e.g. customers@example.com)"
              value={state.emailTo}
              onChange={(e) => setState((s) => ({ ...s, emailTo: e.target.value }))}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Subject"
              value={state.emailSubject}
              onChange={(e) => setState((s) => ({ ...s, emailSubject: e.target.value }))}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <textarea
              placeholder="Body"
              value={state.emailBody}
              onChange={(e) => setState((s) => ({ ...s, emailBody: e.target.value }))}
              rows={3}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <OffsetInput
              label="Send offset (minutes from launch time)"
              value={state.offsetEmail}
              onChange={(v) => setState((s) => ({ ...s, offsetEmail: v }))}
            />
          </div>
        </fieldset>
      )}

      {state.channels.includes("whatsapp") && (
        <fieldset className="rounded-md border border-slate-200 p-4">
          <legend className="px-1 text-sm font-medium text-slate-700">WhatsApp</legend>
          <div className="space-y-3">
            <textarea
              placeholder="Message"
              value={state.whatsappMessage}
              onChange={(e) => setState((s) => ({ ...s, whatsappMessage: e.target.value }))}
              rows={3}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <OffsetInput
              label="Send offset (minutes from launch time)"
              value={state.offsetWhatsapp}
              onChange={(v) => setState((s) => ({ ...s, offsetWhatsapp: v }))}
            />
          </div>
        </fieldset>
      )}

      {state.channels.includes("social") && (
        <fieldset className="rounded-md border border-slate-200 p-4">
          <legend className="px-1 text-sm font-medium text-slate-700">Social</legend>
          <div className="space-y-3">
            <textarea
              placeholder="Caption"
              value={state.socialCaption}
              onChange={(e) => setState((s) => ({ ...s, socialCaption: e.target.value }))}
              rows={3}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <OffsetInput
              label="Post offset (minutes from launch time)"
              value={state.offsetSocial}
              onChange={(v) => setState((s) => ({ ...s, offsetSocial: v }))}
            />
          </div>
        </fieldset>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700">When</label>
        <div className="mt-2 flex items-center gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={state.when === "now"}
              onChange={() => setState((s) => ({ ...s, when: "now" }))}
            />
            Launch now
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={state.when === "later"}
              onChange={() => setState((s) => ({ ...s, when: "later" }))}
            />
            Schedule for later
          </label>
          {state.when === "later" && (
            <input
              type="datetime-local"
              value={state.scheduledFor}
              onChange={(e) => setState((s) => ({ ...s, scheduledFor: e.target.value }))}
              className="rounded-md border border-slate-300 px-2 py-1 text-sm"
            />
          )}
        </div>
      </div>

      {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {submitting ? "Saving…" : isEdit ? "Save & re-check" : "Create Launch"}
      </button>
    </form>
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
