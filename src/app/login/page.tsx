"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Wrong code.");
      setSubmitting(false);
      return;
    }
    const dest = searchParams.get("from") || "/";
    router.push(dest);
    router.refresh();
  }

  return (
    <div className="flex min-h-[calc(100vh-2rem)] items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white">
      <Card className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-sm">
            MO
          </span>
          <div>
            <p className="text-sm font-semibold leading-tight tracking-tight">Marketing OS</p>
            <p className="text-[11px] leading-tight text-slate-400">Launch Hub</p>
          </div>
        </div>

        <div className="mb-5">
          <span className="mb-2 inline-block rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-600">
            Demo
          </span>
          <h1 className="text-lg font-semibold tracking-tight">Enter the demo</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
            The code&apos;s public, it&apos;s a demo: <strong className="text-slate-700">3141</strong>,
            the first four digits of pi. Nothing sensitive lives behind this, it just makes the
            app feel like something you sign into.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="3141"
            autoFocus
            className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-center text-2xl tracking-[0.5em] transition-shadow focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <Button type="submit" disabled={submitting || code.length !== 4} className="w-full">
            {submitting ? "Checking…" : "Continue"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
