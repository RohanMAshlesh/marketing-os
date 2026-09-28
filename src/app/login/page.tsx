"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
            MO
          </span>
          <div>
            <p className="text-sm font-semibold leading-tight">Marketing OS</p>
            <p className="text-xs leading-tight text-slate-500">Launch Hub</p>
          </div>
        </div>

        <h1 className="mb-1 text-lg font-semibold">Enter the demo</h1>
        <p className="mb-5 text-sm text-slate-500">
          This is a demo, so the code&apos;s public: it&apos;s <strong>3141</strong>, the
          first four digits of pi. Nothing sensitive is behind this door, it just
          makes the app feel like something you sign into.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="3141"
            autoFocus
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-center text-2xl tracking-[0.5em] focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting || code.length !== 4}
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? "Checking…" : "Continue"}
          </button>
        </form>
      </div>
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
