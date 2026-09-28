"use client";

import { Suspense, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ArrowLeftIcon } from "@/components/ui/Icons";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<"identifier" | "otp">("identifier");
  const [identifier, setIdentifier] = useState("");
  const [digits, setDigits] = useState<string[]>(["", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  function handleIdentifierSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!identifier.trim()) {
      setError("Enter your email or phone number.");
      return;
    }
    setError(null);
    setStep("otp");
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
  }

  function updateDigit(index: number, value: string) {
    const clean = value.replace(/[^0-9]/g, "").slice(-1);
    setDigits((d) => {
      const next = [...d];
      next[index] = clean;
      return next;
    });
    if (clean && index < 3) inputRefs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 4);
    if (!pasted) return;
    e.preventDefault();
    setDigits((d) => {
      const next = [...d];
      for (let i = 0; i < 4; i++) next[i] = pasted[i] ?? next[i];
      return next;
    });
    inputRefs.current[Math.min(pasted.length, 3)]?.focus();
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const code = digits.join("");
    if (code.length !== 4) {
      setError("Enter the full 4-digit code.");
      return;
    }
    setError(null);
    setSubmitting(true);
    const res = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, identifier }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "That code didn't match.");
      setSubmitting(false);
      setDigits(["", "", "", ""]);
      inputRefs.current[0]?.focus();
      return;
    }
    const dest = searchParams.get("from") || "/";
    router.push(dest);
    router.refresh();
  }

  return (
    <div className="mesh-bg flex min-h-[calc(100vh-2rem)] items-center justify-center">
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

        {step === "identifier" ? (
          <>
            <h1 className="text-lg font-semibold tracking-tight">Sign in</h1>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
              Enter your email or phone number and we&apos;ll send you a one-time code.
            </p>
            <form onSubmit={handleIdentifierSubmit} className="mt-5 space-y-3">
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you@company.com or +1 555 000 1111"
                autoFocus
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm transition-shadow focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
              {error && <p className="text-sm text-rose-600">{error}</p>}
              <Button type="submit" className="w-full">
                Continue
              </Button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-lg font-semibold tracking-tight">Enter your code</h1>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
              We sent a 4-digit code to <strong className="text-slate-700">{identifier}</strong>. Stuck?
              It&apos;s the first four digits of pi.
            </p>
            <form onSubmit={handleVerify} className="mt-5 space-y-4">
              <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
                {digits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      inputRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => updateDigit(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="h-14 w-12 rounded-lg border border-slate-300 text-center text-2xl font-semibold transition-shadow focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  />
                ))}
              </div>
              {error && <p className="text-center text-sm text-rose-600">{error}</p>}
              <Button type="submit" disabled={submitting || digits.some((d) => !d)} className="w-full">
                {submitting ? "Verifying…" : "Verify"}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setStep("identifier");
                  setDigits(["", "", "", ""]);
                  setError(null);
                }}
                className="flex w-full items-center justify-center gap-1 text-xs text-slate-400 hover:text-slate-600"
              >
                <ArrowLeftIcon className="h-3.5 w-3.5" />
                Use a different email or phone
              </button>
            </form>
          </>
        )}
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
