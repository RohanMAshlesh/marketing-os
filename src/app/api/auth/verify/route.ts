import { NextRequest, NextResponse } from "next/server";

const DEMO_CODE = "3141"; // first four digits of pi, shown openly on the login page

export async function POST(req: NextRequest) {
  const { code } = (await req.json()) as { code: string };

  if (code?.trim() !== DEMO_CODE) {
    return NextResponse.json({ error: "That's not it. Hint: first four digits of pi." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("mos_auth", "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
  return res;
}
