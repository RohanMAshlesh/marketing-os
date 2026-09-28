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
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const STATE_STYLES: Record<ChannelState, { label: string; variant: Parameters<typeof Badge>[0]["variant"]; dot: string }> = {
  idle: { label: "Idle", variant: "neutral", dot: "bg-slate-300" },
  scheduled: { label: "Scheduled", variant: "info", dot: "bg-blue-500" },
  pending: { label: "Sending…", variant: "warning", dot: "bg-amber-500 animate-pulse" },
  live: { label: "Live", variant: "success", dot: "bg-emerald-500" },
  failed: { label: "Failed", variant: "danger", dot: "bg-rose-500" },
};

const APPROVAL_VARIANT: Record<ApprovalStatus, Parameters<typeof Badge>[0]["variant"]> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

const APPROVAL_LABEL: Record<ApprovalStatus, string> = {
  pending: "Awaiting approval",
  approved: "Approved",
  rejected: "Changes requested",
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
        <h1 className="text-xl font-semibold tracking-tight">{launch.name}</h1>
        <Link href={`/launches/${launch.id}/edit`} className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline">
          Edit content
        </Link>
      </div>

      <Card className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Content approval</h2>
          <span className="text-xs text-slate-400">
            {role === "approver" ? "You can approve or request changes" : "Waiting on an approver"}
          </span>
        </div>
        <ul className="space-y-2">
          {launch.channels.map((channel) => {
            const approval = launch.channelApprovals[channel];
            return (
              <li
                key={channel}
                className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-3 text-sm"
              >
                <span className="font-medium">{CHANNEL_LABELS[channel]}</span>
                <div className="flex items-center gap-2">
                  <Badge variant={APPROVAL_VARIANT[approval.status]}>{APPROVAL_LABEL[approval.status]}</Badge>
                  {role === "approver" && approval.status !== "approved" && (
                    <Button size="sm" variant="secondary" className="!border-emerald-300 !text-emerald-700 hover:!bg-emerald-50" onClick={() => onSetApproval(channel, "approved")}>
                      Approve
                    </Button>
                  )}
                  {role === "approver" && approval.status !== "rejected" && (
                    <Button size="sm" variant="danger" onClick={() => onSetApproval(channel, "rejected")}>
                      Request changes
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card>
        <h2 className="mb-1 text-sm font-semibold text-slate-700">Readiness check</h2>
        {launch.flags.length === 0 ? (
          <p className="text-sm text-emerald-700">No issues found.</p>
        ) : (
          <ul className="space-y-3">
            {launch.flags.map((flag: ReadinessFlag) => (
              <li
                key={flag.id}
                className={`flex items-start justify-between gap-4 rounded-lg border p-3 text-sm ${
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
                  <Button size="sm" variant="secondary" className="shrink-0 whitespace-nowrap" onClick={() => onAcknowledge(flag.id)}>
                    Acknowledge
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 border-t border-slate-100 pt-4">
          <p className="mb-3 text-xs text-slate-500">
            Channels: {launch.channels.map((c) => CHANNEL_LABELS[c]).join(", ")}
            {launch.scheduledFor
              ? ` · scheduled for ${new Date(launch.scheduledFor).toLocaleString()}`
              : " · launching immediately"}
          </p>
          {error && <p className="mb-2 text-sm text-rose-700">{error}</p>}
          <Button onClick={onLaunch} disabled={!canLaunch || launching}>
            {launching ? "Launching…" : canLaunch ? "🚀 Launch" : blockedReason}
          </Button>
        </div>
      </Card>
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
        <h1 className="text-xl font-semibold tracking-tight">{launch.name}</h1>
        <p className="text-sm text-slate-500">
          {launch.stage === "done" ? "Completed" : "In progress"} ·{" "}
          {new Date(launch.createdAt).toLocaleString()}
        </p>
      </div>

      <Card className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Status board</h2>
          <Badge
            variant={failed > 0 ? "danger" : resolved === total ? "success" : "info"}
            className="px-3 py-1 text-sm font-semibold"
          >
            {live}/{total} live{failed > 0 ? `, ${failed} failed` : ""}
          </Badge>
        </div>

        <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ${failed > 0 ? "bg-rose-500" : "bg-emerald-500"}`}
            style={{ width: `${total === 0 ? 0 : (resolved / total) * 100}%` }}
          />
        </div>

        <div className="space-y-3">
          {launch.channels.map((channel: ChannelKey) => {
            const status = launch.channelStatus[channel];
            const style = STATE_STYLES[status.state];
            return (
              <div
                key={channel}
                className="flex items-center justify-between rounded-lg border border-slate-100 p-3"
              >
                <div className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
                  <div>
                    <p className="text-sm font-medium">{CHANNEL_LABELS[channel]}</p>
                    {status.detail && <p className="text-xs text-slate-500">{status.detail}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={style.variant}>{style.label}</Badge>
                  <p className="mt-0.5 text-[11px] text-slate-400">{formatTime(status.updatedAt)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <AskBox launchId={launch.id} />

      <Link href="/" className="mt-2 inline-block text-sm text-indigo-600 hover:text-indigo-700 hover:underline">
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
    <Card className="mb-6">
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
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
        <Button variant="secondary" onClick={ask} disabled={asking}>
          {asking ? "Asking…" : "Ask"}
        </Button>
      </div>
    </Card>
  );
}
