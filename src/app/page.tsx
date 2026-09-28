import Link from "next/link";
import { store, progressSummary } from "@/lib/store";
import { CHANNEL_LABELS } from "@/lib/types";

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

function stageLabel(stage: string, progressLabel: string): { text: string; className: string } {
  if (stage === "review") {
    const className = progressLabel === "Changes requested" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800";
    return { text: progressLabel, className };
  }
  if (progressLabel.includes("failed"))
    return { text: progressLabel, className: "bg-rose-100 text-rose-800" };
  if (stage === "launching") return { text: progressLabel, className: "bg-blue-100 text-blue-800" };
  return { text: progressLabel, className: "bg-emerald-100 text-emerald-800" };
}

export default function DashboardPage() {
  const launches = store.list();

  if (launches.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center">
        <h1 className="text-lg font-semibold">No launches yet</h1>
        <p className="mt-1 text-sm text-slate-500">
          Create your first Launch to schedule content across every channel from one place.
        </p>
        <Link
          href="/launches/new"
          className="mt-4 inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Create your first Launch
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-baseline justify-between">
        <h1 className="text-xl font-semibold">Launches</h1>
        <p className="text-sm text-slate-500">{launches.length} total</p>
      </div>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Launch</th>
              <th className="px-4 py-3 font-medium">Channels</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {launches.map((launch) => {
              const progress = progressSummary(launch);
              const badge = stageLabel(launch.stage, progress.label);
              return (
                <tr key={launch.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/launches/${launch.id}`} className="font-medium text-indigo-600 hover:underline">
                      {launch.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {launch.channels.map((c) => CHANNEL_LABELS[c]).join(", ")}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}>
                      {badge.text}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{relativeTime(launch.createdAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
