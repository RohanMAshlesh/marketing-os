import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

interface Params {
  params: { id: string };
}

export async function POST(_req: NextRequest, { params }: Params) {
  const launch = store.get(params.id);
  if (!launch) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!store.canLaunch(launch)) {
    const flagsClear = launch.flags.every((f) => f.acknowledged);
    const unapproved = launch.channels.filter((c) => launch.channelApprovals[c].status !== "approved");
    const error = !flagsClear
      ? "All readiness flags must be fixed or acknowledged before launching."
      : `${unapproved.length} channel${unapproved.length === 1 ? "" : "s"} still need${unapproved.length === 1 ? "s" : ""} approval before launching.`;
    return NextResponse.json({ error }, { status: 409 });
  }

  const updated = store.trigger(params.id);
  return NextResponse.json({ launch: updated });
}
