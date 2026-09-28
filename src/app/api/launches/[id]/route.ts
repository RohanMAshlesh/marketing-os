import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { ChannelKey, ChannelOffsets, LaunchContent } from "@/lib/types";

interface Params {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: Params) {
  const launch = store.get(params.id);
  if (!launch) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ launch });
}

interface UpdateBody {
  name: string;
  channels: ChannelKey[];
  content: LaunchContent;
  offsets: ChannelOffsets;
  scheduledFor: string | null;
}

export async function PUT(req: NextRequest, { params }: Params) {
  const body = (await req.json()) as UpdateBody;
  const launch = store.update(params.id, {
    name: body.name.trim(),
    channels: body.channels,
    content: body.content,
    offsets: body.offsets ?? {},
    scheduledFor: body.scheduledFor ?? null,
  });
  if (!launch) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ launch });
}
