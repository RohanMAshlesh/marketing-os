import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { ApprovalStatus, ChannelKey } from "@/lib/types";

interface Params {
  params: { id: string };
}

export async function POST(req: NextRequest, { params }: Params) {
  const { channel, status, note } = (await req.json()) as {
    channel: ChannelKey;
    status: ApprovalStatus;
    note?: string;
  };

  const launch = store.setApproval(params.id, channel, status, note);
  if (!launch) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ launch });
}
