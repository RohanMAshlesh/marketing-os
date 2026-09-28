# Testing

## Automated (Vitest)

```bash
npm test
```

41 tests across 5 files, all passing:

| File | Covers |
|---|---|
| `src/lib/readiness.test.ts` | Every readiness rule: missing content per channel, the WhatsApp opt-out keyword check (including that it's case-insensitive), the >10-minute timing-skew check, and that multiple flags can fire at once. |
| `src/lib/store.test.ts` | Launch creation, that `canLaunch` requires **both** every flag acknowledged **and** every channel approved, that editing a launch resets approvals back to pending, that a rejected channel blocks launch until re-approved, and a full end-to-end `trigger()` run (via fake timers) that resolves every channel to live/failed and marks the launch done. |
| `src/lib/ai.test.ts` | The template fallback for content drafting and the Q&A answerer when no `OPENROUTER_API_KEY` is set (the default, $0 path). |
| `src/middleware.test.ts` | **The auth-gate regression test**: every protected route (`/`, `/launches/new`, `/launches/[id]`, `/know-the-demo`) redirects to `/login` with no session cookie, passes through with one, `/login` and `/api/auth/*` are never gated, and a wrong cookie value is treated as no cookie. This locks in "auth must be at the start, not per-page." |
| `src/app/api/auth/verify/route.test.ts` | The login endpoint accepts `3141` and sets the session cookie, rejects anything else, and stores the identifier (email/phone) in a separate readable cookie only when one was given. |

Run `npx tsc --noEmit` and `npm run build` alongside `npm test` — both are clean.

## Manual QA (browser, this session)

Walked end-to-end after the UI revamp, with a fresh session (no cookie) each time:

1. Hitting any URL with no session cookie → redirected to `/login` immediately (verified via curl against `/`, `/launches/new`, `/launches/<id>`, `/know-the-demo`, all `307` to `/login?from=...`).
2. Logging in with `3141` → lands on the Dashboard.
3. New Launch → typed a one-line brief → **Draft with AI** → filled every selected channel's content.
4. Edited the WhatsApp message to remove the opt-out phrase, set Social's offset to 25 minutes → submitted → both readiness flags appeared as expected.
5. Switched **Viewing as → Approver** → approved all 3 channels.
6. Switched back to **Manager** → acknowledged both flags → **Launch** enabled and fired.
7. Status board reached **3/3 live** within seconds; **Ask about this launch** answered correctly.
8. Dashboard showed the new launch in history with the right status.
9. **Know the demo** page: diagram animates and cycles through all 6 nodes plus the 3 channel dots; copy renders correctly.
10. **Log out** → immediately bounced back to `/login`, confirming the cookie was actually cleared.

## Manual QA — round 2 (redesign, OpenRouter, auth flow, role dropdown)

Repeated after the professional redesign, the OpenRouter integration, the
two-step email/phone + OTP login, and the role dropdown fix, again against
the running dev server:

1. Logged out, then walked the **new two-step login**: entered an email,
   got to the 4-digit code screen (identifier echoed back, pi hint shown,
   code never spelled out), typed `3141` across the 4 boxes, verified.
   (One false alarm here worth recording: a screenshot taken immediately
   after typing looked like only the first digit had landed — checking the
   actual DOM values directly showed all 4 digits were correct; it was a
   stale screenshot frame, not a real input bug.)
2. **Draft with AI** with a real `OPENROUTER_API_KEY` configured: got
   genuinely model-written copy back (not the template) for email,
   WhatsApp, and social from one brief — confirmed via the actual DOM
   values, not just the "drafted with AI" note. The WhatsApp draft
   included the opt-out phrase on its own, so the readiness check came
   back clean.
3. **Role dropdown**: switched Manager → Approver → Manager from the
   header on both the Dashboard and a launch's Readiness Check screen —
   the view updated immediately in place, no navigation, no reload. This
   is the fix for "the toggle isn't working": the old segmented buttons
   worked but the Dashboard itself never changed with the role; now it
   shows a distinct "needs your approval" queue for Approver view.
4. Approved all channels, launched, watched the status board hit 3/3
   live, then asked the **Ask box** an open-ended question ("how did the
   launch go overall?") — the real model gave a specific, accurate answer
   synthesized from the actual channel data, not a canned line.
5. **Know the demo** page: diagram nodes are now line icons instead of
   emoji, copy correctly references OpenRouter instead of Claude, and the
   login paragraph matches the new indirect pi hint.
6. Grepped the whole `src/` tree for leftover `Claude`/`Anthropic`
   references after the switch to OpenRouter — found and fixed one
   (`"Drafted with Claude"` in the UI copy) that the type checker
   couldn't have caught since it was just a string literal.

## Known gaps (not automated)
- No browser-driven E2E test (Playwright, etc.) is checked into the repo — the flows above were verified manually in this session instead, to avoid the added weight of downloading browser binaries in this environment. If you want that automated too, Playwright is the natural next step.
- The simulated WhatsApp/social connectors have a small random failure rate (~5%) by design (see `src/lib/connectors.ts`) — an occasional "Failed" badge on those channels during manual testing is expected behavior, not a bug.
