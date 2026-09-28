import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { answerLaunchQuestion } from "@/lib/ai";

interface Params {
  params: { id: string };
}

export async function POST(req: NextRequest, { params }: Params) {
  const { question } = (await req.json()) as { question: string };
  const launch = store.get(params.id);
  if (!launch) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!question?.trim()) return NextResponse.json({ error: "Ask a question." }, { status: 400 });

  const answer = await answerLaunchQuestion(launch, question.trim());
  return NextResponse.json({ answer });
}
