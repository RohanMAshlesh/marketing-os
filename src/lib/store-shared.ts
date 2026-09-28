import { Launch } from "./types";

/**
 * Pure, stateless helpers over a Launch — safe to import from client
 * components too (unlike store.ts, which pulls in Node's crypto and a
 * server-only singleton).
 */
export function progressSummary(launch: Launch): { liveOrDone: number; total: number; label: string } {
  const total = launch.channels.length;
  const liveOrDone = launch.channels.filter((c) => launch.channelStatus[c].state === "live").length;
  const failed = launch.channels.filter((c) => launch.channelStatus[c].state === "failed").length;

  if (launch.stage === "review") {
    const rejected = launch.channels.some((c) => launch.channelApprovals[c].status === "rejected");
    const pendingApproval = launch.channels.some((c) => launch.channelApprovals[c].status === "pending");
    if (rejected) return { liveOrDone, total, label: "Changes requested" };
    if (pendingApproval) return { liveOrDone, total, label: "Awaiting approval" };
    return { liveOrDone, total, label: "Awaiting review" };
  }
  if (launch.stage === "launching") return { liveOrDone, total, label: `${liveOrDone}/${total} live` };

  if (failed > 0) return { liveOrDone, total, label: `${liveOrDone}/${total} live, ${failed} failed` };
  return { liveOrDone, total, label: `${liveOrDone}/${total} live` };
}
