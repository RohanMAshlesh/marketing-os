import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

function postCode(code: string): NextRequest {
  return new NextRequest("http://localhost:3000/api/auth/verify", {
    method: "POST",
    body: JSON.stringify({ code }),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/auth/verify", () => {
  it("accepts 3141 (first four digits of pi) and sets the session cookie", async () => {
    const res = await POST(postCode("3141"));
    expect(res.status).toBe(200);
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("mos_auth=1");
  });

  it("rejects any other code", async () => {
    const res = await POST(postCode("0000"));
    expect(res.status).toBe(401);
  });

  it("rejects an empty code", async () => {
    const res = await POST(postCode(""));
    expect(res.status).toBe(401);
  });
});
