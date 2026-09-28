import { NextRequest, NextResponse } from "next/server";

const DEMO_CODE = "3141"; // first four digits of pi — hinted at, not spelled out, on the login page

export async function POST(req: NextRequest) {
  const { code, identifier } = (await req.json()) as { code: string; identifier?: string };

  if (code?.trim() !== DEMO_CODE) {
    return NextResponse.json({ error: "That code didn't match. Hint: first four digits of pi." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("mos_auth", "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
  if (identifier?.trim()) {
    res.cookies.set("mos_identifier", identifier.trim(), {
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }
  return res;
}
