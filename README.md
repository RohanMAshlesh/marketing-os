# Marketing OS — Launch Hub (MVP + v1)

A single hub to schedule, launch, and monitor approved campaign content across
multiple channels, now with AI-assisted content drafting and a lightweight
approval step — the MVP + v1 slice of the broader "Marketing OS" vision. Full
product thinking (problem frame, persona, scope, roadmap) lives in
[`outputs/`](outputs/); what changed in v1 specifically is in
[`outputs/09-v1-notes/v1-build-notes.md`](outputs/09-v1-notes/v1-build-notes.md).

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. The dashboard comes pre-seeded with 3 example
past launches so it's never empty.

## Real email (optional)

Email is the one real integration in this MVP (via [Resend](https://resend.com)'s
free tier). Without an API key, the app **simulates** the email send instead of
failing — so it runs out of the box with zero setup.

To send a real email:
1. Create a free Resend account and API key.
2. Copy `.env.example` to `.env.local` and set `RESEND_API_KEY`.
3. Optionally set `RESEND_FROM` (defaults to Resend's shared test sender,
   which can only deliver to the email address on your Resend account until
   you verify a domain).

WhatsApp and Social are fully simulated in this MVP — see
[`outputs/08-prototype-plan/prototype-plan.md`](outputs/08-prototype-plan/prototype-plan.md)
for why, and the roadmap for when that changes.

## AI content drafting & the Ask box (optional real AI)

Both the "Draft with AI" button (New Launch form) and the "Ask about this
launch" box (Status Board) work with **zero setup** using a deterministic
fallback. To use real Claude generation instead, set `ANTHROPIC_API_KEY` in
`.env.local` — **this is the one feature that costs real money per call** if
enabled; everything else in the app stays $0 regardless.

## Approval workflow (no login needed)

Every channel's content must be **approved** before a Launch can fire.
There's no real auth — instead, use the **"Viewing as"** switcher in the
header to flip between **Campaign Manager** (creates/edits content, can't
self-approve) and **Approver** (approves or requests changes) to demo both
sides of the workflow yourself.

## Demo script

1. From the dashboard, click **New Launch**.
2. Name: `Autumn Sale Launch`. Keep all 3 channels selected.
3. Optionally type a one-line brief and click **Draft with AI** to fill in content, or write it by hand.
4. Make sure the WhatsApp message is missing "stop"/"unsubscribe" (e.g. edit it out)
   → will trigger the compliance-keyword flag.
5. Set the Social **offset to 25** (minutes) → triggers the timing-skew flag.
6. Submit → the Readiness Check screen shows both flags, and every channel is "Awaiting approval."
7. Switch **Viewing as → Approver** in the header, click **Approve** on each channel.
8. Switch back to **Campaign Manager**, click **Acknowledge** on each flag, then **Launch**.
9. Watch the Status Board hit **3/3 live** within a few seconds — the value moment.
10. Try the **Ask about this launch** box, e.g. "did anything fail?"
11. Go back to the dashboard to see it listed in history.

## Project structure
- `src/lib/types.ts` — data model
- `src/lib/store.ts` — in-memory data store, seed data, launch scheduler/ticker, approval gating
- `src/lib/readiness.ts` — the readiness-check rule engine
- `src/lib/connectors.ts` — channel "sends" (real email, simulated WhatsApp/social)
- `src/lib/ai.ts` — content drafting + status Q&A (real Claude call or free fallback)
- `src/lib/role.ts` + `src/components/RoleSwitcher.tsx` — the manager/approver demo switcher
- `src/app/api/launches/*`, `src/app/api/draft/*` — REST-ish API routes
- `src/app/(pages)` + `src/components/LaunchForm.tsx` / `LaunchView.tsx` — UI

## Known shortcuts (by design, not oversights)
See [`outputs/07-lite-prd/lite-prd.md`](outputs/07-lite-prd/lite-prd.md) →
Assumptions & Shortcuts. In short: in-memory storage (resets on server
restart), no auth, no real WhatsApp/social APIs, deterministic rule-based
readiness checks (no live LLM call) — all deliberate choices to keep this
genuinely free and demo-reliable.

## Roadmap
See [`outputs/05-concept-scope/concept-scope.md`](outputs/05-concept-scope/concept-scope.md)
for the full MVP → v1 → v2 plan (content generation & approval in v1;
planning, measurement, and real paid channel integrations in v2).
