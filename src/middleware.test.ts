import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "./middleware";

function requestFor(path: string, cookie?: string): NextRequest {
  return new NextRequest(new URL(`http://localhost:3000${path}`), {
    headers: cookie ? { cookie } : undefined,
  });
}

describe("auth middleware — gates the app from the very first request", () => {
  const protectedPaths = ["/", "/launches/new", "/launches/some-id", "/know-the-demo"];

  for (const path of protectedPaths) {
    it(`redirects ${path} to /login when there's no session cookie (not just on a campaign click)`, () => {
      const res = middleware(requestFor(path));
      expect(res.status).toBe(307);
      const location = new URL(res.headers.get("location")!);
      expect(location.pathname).toBe("/login");
      expect(location.searchParams.get("from")).toBe(path);
    });

    it(`lets ${path} through once the session cookie is set`, () => {
      const res = middleware(requestFor(path, "mos_auth=1"));
      // NextResponse.next() carries this internal header instead of a redirect
      expect(res.headers.get("location")).toBeNull();
    });
  }

  it("never redirects the login page itself (no redirect loop)", () => {
    const res = middleware(requestFor("/login"));
    expect(res.headers.get("location")).toBeNull();
  });

  it("never redirects the auth API routes (or verifying the code would be impossible)", () => {
    const res = middleware(requestFor("/api/auth/verify"));
    expect(res.headers.get("location")).toBeNull();
  });

  it("treats a wrong cookie value the same as no cookie at all", () => {
    const res = middleware(requestFor("/", "mos_auth=0"));
    expect(res.status).toBe(307);
  });
});
