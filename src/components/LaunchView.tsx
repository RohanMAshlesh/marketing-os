"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChannelKey, ChannelState, CHANNEL_LABELS, Launch, ReadinessFlag } from "@/lib/types";

const STATE_STYLES: Record<ChannelState, { label: string; className: string; dot: string }> = {
  idle: { label: "Idle", className: "bg-slate-100 text-slate-500", dot: "bg-slate-400" },
  scheduled: { label: "Scheduled", className: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  pending: { label: "Sending…", className: "bg-amber-100 text-amber-800", dot: "bg-amber-500 animate-pulse" },
  live: { label: "Live", className: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-500" },
  failed: { label: "Failed", className: "bg-rose-100 text-rose-800", dot: "bg-rose-500" },
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
    return <ReadinessCheck launch={launch} onAcknowledge={acknowledge} onLaunch={triggerLaunch} launching={launching} error={launchError} />;
  }

  return <StatusBoard launch={launch} />;
}

function ReadinessCheck({
  launch,
  onAcknowledge,
  onLaunch,
  launching,
  error,
}: {
  launch: Launch;
  onAcknowledge: (flagId: string) => void;
  onLaunch: () => void;
  launching: boolean;
  error: string | null;
}) {
  const unresolved = launch.flags.filter((f) => !f.acknowledged);
  const canLaunch = unresolved.length === 0;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-baseline justify-between">
        <h1 className="text-xl font-semibold">{launch.name}</h1>
        <Link href={`/launches/${launch.id}/edit`} className="text-sm text-indigo-600 hover:underline">
          Edit content
        </Link>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-1 text-sm font-semibold text-slate-700">Readiness check</h2>
        {launch.flags.length === 0 ? (
          <p className="text-sm text-emerald-700">No issues found. Ready to launch.</p>
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
            {launching ? "Launching…" : canLaunch ? "Launch" : `Resolve ${unresolved.length} flag${unresolved.length === 1 ? "" : "s"} to launch`}
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

      <Link href="/" className="text-sm text-indigo-600 hover:underline">
        ← Back to dashboard
      </Link>
    </div>
  );
}
