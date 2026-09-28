import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { ChannelKey, ChannelOffsets, LaunchContent } from "@/lib/types";

export async function GET() {
  return NextResponse.json({ launches: store.list() });
}

interface CreateBody {
  name: string;
  channels: ChannelKey[];
  content: LaunchContent;
  offsets: ChannelOffsets;
  scheduledFor: string | null;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as CreateBody;

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Launch name is required." }, { status: 400 });
  }
  if (!body.channels?.length) {
    return NextResponse.json({ error: "Select at least one channel." }, { status: 400 });
  }

  const launch = store.create({
    name: body.name.trim(),
    channels: body.channels,
    content: body.content,
    offsets: body.offsets ?? {},
    scheduledFor: body.scheduledFor ?? null,
  });

  return NextResponse.json({ launch }, { status: 201 });
}
