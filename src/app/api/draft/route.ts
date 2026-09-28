import { NextRequest, NextResponse } from "next/server";
import { draftContent } from "@/lib/ai";
import { ChannelKey } from "@/lib/types";

export async function POST(req: NextRequest) {
  const { brief, channels } = (await req.json()) as { brief: string; channels: ChannelKey[] };

  if (!brief?.trim()) {
    return NextResponse.json({ error: "Write a brief first." }, { status: 400 });
  }
  if (!channels?.length) {
    return NextResponse.json({ error: "Select at least one channel first." }, { status: 400 });
  }

  const content = await draftContent(brief.trim(), channels);
  return NextResponse.json({ content, usedRealAi: Boolean(process.env.OPENROUTER_API_KEY) });
}
