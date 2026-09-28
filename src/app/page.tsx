import Link from "next/link";
import { store, progressSummary } from "@/lib/store";
import { CHANNEL_LABELS } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function stageBadge(stage: string, progressLabel: string): { text: string; variant: Parameters<typeof Badge>[0]["variant"] } {
  if (stage === "review") {
    return { text: progressLabel, variant: progressLabel === "Changes requested" ? "danger" : "warning" };
  }
  if (progressLabel.includes("failed")) return { text: progressLabel, variant: "danger" };
  if (stage === "launching") return { text: progressLabel, variant: "info" };
  return { text: progressLabel, variant: "success" };
}

export default function DashboardPage() {
  const launches = store.list();

  if (launches.length === 0) {
    return (
      <Card className="border-dashed py-16 text-center">
        <h1 className="text-lg font-semibold">No launches yet</h1>
        <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
          Create your first Launch to schedule content across every channel from one place.
        </p>
        <Link href="/launches/new" className="mt-5 inline-block">
          <Button>Create your first Launch</Button>
        </Link>
      </Card>
    );
  }

  const needsApproval = launches.filter((l) => l.stage === "review").length;
  const inProgress = launches.filter((l) => l.stage === "launching").length;
  const hasFailures = launches.filter((l) => progressSummary(l).label.includes("failed")).length;

  return (
    <div>
      <div className="mb-6 flex items-baseline justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Launches</h1>
        <Link href="/launches/new" className="sm:hidden">
          <Button size="sm">New Launch</Button>
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Total" value={launches.length} />
        <Stat label="Needs approval" value={needsApproval} tone={needsApproval > 0 ? "warning" : undefined} />
        <Stat label="In progress" value={inProgress} tone={inProgress > 0 ? "info" : undefined} />
        <Stat label="With failures" value={hasFailures} tone={hasFailures > 0 ? "danger" : undefined} />
      </div>

      <Card padded={false} className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50/60 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">Launch</th>
              <th className="px-5 py-3 font-medium">Channels</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {launches.map((launch) => {
              const progress = progressSummary(launch);
              const badge = stageBadge(launch.stage, progress.label);
              return (
                <tr key={launch.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-5 py-3.5">
                    <Link href={`/launches/${launch.id}`} className="font-medium text-slate-900 hover:text-indigo-600">
                      {launch.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">
                    {launch.channels.map((c) => CHANNEL_LABELS[c]).join(", ")}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant={badge.variant}>{badge.text}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400">{relativeTime(launch.createdAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "warning" | "info" | "danger";
}) {
  const toneClass =
    tone === "warning"
      ? "text-amber-600"
      : tone === "info"
      ? "text-blue-600"
      : tone === "danger"
      ? "text-rose-600"
      : "text-slate-900";
  return (
    <Card className="p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${toneClass}`}>{value}</p>
    </Card>
  );
}
