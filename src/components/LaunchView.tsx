"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ApprovalStatus,
  ChannelKey,
  ChannelState,
  CHANNEL_LABELS,
  Launch,
  ReadinessFlag,
} from "@/lib/types";
import { useRole } from "@/lib/role";

const STATE_STYLES: Record<ChannelState, { label: string; className: string; dot: string }> = {
  idle: { label: "Idle", className: "bg-slate-100 text-slate-500", dot: "bg-slate-400" },
  scheduled: { label: "Scheduled", className: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  pending: { label: "Sending…", className: "bg-amber-100 text-amber-800", dot: "bg-amber-500 animate-pulse" },
  live: { label: "Live", className: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-500" },
  failed: { label: "Failed", className: "bg-rose-100 text-rose-800", dot: "bg-rose-500" },
};

const APPROVAL_STYLES: Record<ApprovalStatus, { label: string; className: string }> = {
  pending: { label: "Awaiting approval", className: "bg-amber-100 text-amber-800" },
  approved: { label: "Approved", className: "bg-emerald-100 text-emerald-800" },
  rejected: { label: "Changes requested", className: "bg-rose-100 text-rose-800" },
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function LaunchView({ initialLaunch }: { initialLaunch: Launch }) {
  const [launch, setLaunch] = useState<Launch>(initialLaunch);
  const [launching, setLaunching] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (launch.stage === "review") return;
    if (launch.stage === "done") return;

    pollRef.current = setInterval(async () => {
      const res = await fetch(`/api/launches/${launch.id}`);
      if (res.ok) {
        const data = await res.json();
        setLaunch(data.launch);
      }
    }, 1500);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [launch.stage, launch.id]);

  async function acknowledge(flagId: string) {
    setLaunch((l) => ({
      ...l,
      flags: l.flags.map((f) => (f.id === flagId ? { ...f, acknowledged: true } : f)),
    }));
    await fetch(`/api/launches/${launch.id}/acknowledge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flagId }),
    });
  }

  async function setApproval(channel: ChannelKey, status: ApprovalStatus) {
    setLaunch((l) => ({
      ...l,
      channelApprovals: { ...l.channelApprovals, [channel]: { status } },
    }));
    const res = await fetch(`/api/launches/${launch.id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel, status }),
    });
    if (res.ok) {
      const data = await res.json();
      setLaunch(data.launch);
    }
  }

  async function triggerLaunch() {
    setLaunching(true);
    setLaunchError(null);
    const res = await fetch(`/api/launches/${launch.id}/launch`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setLaunchError(data.error ?? "Could not launch.");
      setLaunching(false);
      return;
    }
    setLaunch(data.launch);
    setLaunching(false);
  }

  if (launch.stage === "review") {
    return (
      <ReadinessCheck
        launch={launch}
        onAcknowledge={acknowledge}
        onSetApproval={setApproval}
        onLaunch={triggerLaunch}
        launching={launching}
        error={launchError}
      />
    );
  }

  return <StatusBoard launch={launch} />;
}

function ReadinessCheck({
  launch,
  onAcknowledge,
  onSetApproval,
  onLaunch,
  launching,
  error,
}: {
  launch: Launch;
  onAcknowledge: (flagId: string) => void;
  onSetApproval: (channel: ChannelKey, status: ApprovalStatus) => void;
  onLaunch: () => void;
  launching: boolean;
  error: string | null;
}) {
  const [role] = useRole();
  const unresolvedFlags = launch.flags.filter((f) => !f.acknowledged);
  const unapprovedChannels = launch.channels.filter(
    (c) => launch.channelApprovals[c].status !== "approved"
  );
  const canLaunch = unresolvedFlags.length === 0 && unapprovedChannels.length === 0;

  const blockedReason =
    unapprovedChannels.length > 0
      ? `Awaiting approval on ${unapprovedChannels.length} channel${unapprovedChannels.length === 1 ? "" : "s"}`
      : `Resolve ${unresolvedFlags.length} flag${unresolvedFlags.length === 1 ? "" : "s"} to launch`;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-baseline justify-between">
        <h1 className="text-xl font-semibold">{launch.name}</h1>
        <Link href={`/launches/${launch.id}/edit`} className="text-sm text-indigo-600 hover:underline">
          Edit content
        </Link>
      </div>

      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Content approval</h2>
          <span className="text-xs text-slate-400">
            {role === "approver" ? "You can approve or request changes" : "Waiting on an approver"}
          </span>
        </div>
        <ul className="space-y-2">
          {launch.channels.map((channel) => {
            const approval = launch.channelApprovals[channel];
            const style = APPROVAL_STYLES[approval.status];
            return (
              <li
                key={channel}
                className="flex items-center justify-between rounded-md border border-slate-100 p-3 text-sm"
              >
                <span className="font-medium">{CHANNEL_LABELS[channel]}</span>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${style.className}`}>
                    {style.label}
                  </span>
                  {role === "approver" && approval.status !== "approved" && (
                    <button
                      onClick={() => onSetApproval(channel, "approved")}
                      className="rounded-md border border-emerald-300 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                    >
                      Approve
                    </button>
                  )}
                  {role === "approver" && approval.status !== "rejected" && (
                    <button
                      onClick={() => onSetApproval(channel, "rejected")}
                      className="rounded-md border border-rose-300 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50"
                    >
                      Request changes
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-1 text-sm font-semibold text-slate-700">Readiness check</h2>
        {launch.flags.length === 0 ? (
          <p className="text-sm text-emerald-700">No issues found.</p>
        ) : (
          <ul className="space-y-3">
            {launch.flags.map((flag: ReadinessFlag) => (
              <li
                key={flag.id}
                className={`flex items-start justify-between gap-4 rounded-md border p-3 text-sm ${
                  flag.acknowledged
                    ? "border-slate-200 bg-slate-50 text-slate-400"
                    : flag.severity === "blocker"
                    ? "border-rose-200 bg-rose-50 text-rose-800"
                    : "border-amber-200 bg-amber-50 text-amber-800"
                }`}
              >
                <span>
                  <span className="mr-2 rounded bg-white/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                    {flag.severity}
                  </span>
                  {flag.message}
                </span>
                {!flag.acknowledged && (
                  <button
                    onClick={() => onAcknowledge(flag.id)}
                    className="shrink-0 whitespace-nowrap rounded-md border border-current px-2 py-1 text-xs font-medium"
                  >
                    Acknowledge
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 border-t border-slate-100 pt-4">
          <p className="mb-2 text-xs text-slate-500">
            Channels: {launch.channels.map((c) => CHANNEL_LABELS[c]).join(", ")}
            {launch.scheduledFor
              ? ` · scheduled for ${new Date(launch.scheduledFor).toLocaleString()}`
              : " · launching immediately"}
          </p>
          {error && <p className="mb-2 text-sm text-rose-700">{error}</p>}
          <button
            onClick={onLaunch}
            disabled={!canLaunch || launching}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {launching ? "Launching…" : canLaunch ? "Launch" : blockedReason}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusBoard({ launch }: { launch: Launch }) {
  const total = launch.channels.length;
  const live = launch.channels.filter((c) => launch.channelStatus[c].state === "live").length;
  const failed = launch.channels.filter((c) => launch.channelStatus[c].state === "failed").length;
  const resolved = live + failed;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">{launch.name}</h1>
        <p className="text-sm text-slate-500">
          {launch.stage === "done" ? "Completed" : "In progress"} ·{" "}
          {new Date(launch.createdAt).toLocaleString()}
        </p>
      </div>

      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Status board</h2>
          <span
            className={`rounded-full px-3 py-1 text-sm font-semibold ${
              failed > 0
                ? "bg-rose-100 text-rose-800"
                : resolved === total
                ? "bg-emerald-100 text-emerald-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {live}/{total} live{failed > 0 ? `, ${failed} failed` : ""}
          </span>
        </div>

        <div className="space-y-3">
          {launch.channels.map((channel: ChannelKey) => {
            const status = launch.channelStatus[channel];
            const style = STATE_STYLES[status.state];
            return (
              <div
                key={channel}
                className="flex items-center justify-between rounded-md border border-slate-100 p-3"
              >
                <div className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
                  <div>
                    <p className="text-sm font-medium">{CHANNEL_LABELS[channel]}</p>
                    {status.detail && <p className="text-xs text-slate-500">{status.detail}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${style.className}`}>
                    {style.label}
                  </span>
                  <p className="mt-0.5 text-[11px] text-slate-400">{formatTime(status.updatedAt)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AskBox launchId={launch.id} />

      <Link href="/" className="mt-6 inline-block text-sm text-indigo-600 hover:underline">
        ← Back to dashboard
      </Link>
    </div>
  );
}

function AskBox({ launchId }: { launchId: string }) {
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [history, setHistory] = useState<{ q: string; a: string }[]>([]);

  async function ask() {
    if (!question.trim()) return;
    setAsking(true);
    const q = question.trim();
    setQuestion("");
    try {
      const res = await fetch(`/api/launches/${launchId}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      setHistory((h) => [...h, { q, a: res.ok ? data.answer : data.error }]);
    } finally {
      setAsking(false);
    }
  }

  return (
    <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
      <h2 className="mb-3 text-sm font-semibold text-slate-700">Ask about this launch</h2>
      {history.length > 0 && (
        <ul className="mb-3 space-y-2 text-sm">
          {history.map((h, i) => (
            <li key={i}>
              <p className="font-medium text-slate-700">{h.q}</p>
              <p className="text-slate-500">{h.a}</p>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          placeholder='e.g. "did anything fail?"'
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          onClick={ask}
          disabled={asking}
          className="rounded-md bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-900 disabled:opacity-50"
        >
          {asking ? "Asking…" : "Ask"}
        </button>
      </div>
    </div>
  );
}
