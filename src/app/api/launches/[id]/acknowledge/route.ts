import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

interface Params {
  params: { id: string };
}

export async function POST(req: NextRequest, { params }: Params) {
  const { flagId } = (await req.json()) as { flagId: string };
  const launch = store.acknowledgeFlag(params.id, flagId);
  if (!launch) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ launch });
}
