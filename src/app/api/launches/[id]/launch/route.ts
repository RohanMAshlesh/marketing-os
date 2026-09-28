import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

interface Params {
  params: { id: string };
}

export async function POST(_req: NextRequest, { params }: Params) {
  const launch = store.get(params.id);
  if (!launch) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!store.canLaunch(launch)) {
    return NextResponse.json(
      { error: "All readiness flags must be fixed or acknowledged before launching." },
      { status: 409 }
    );
  }

  const updated = store.trigger(params.id);
  return NextResponse.json({ launch: updated });
}
