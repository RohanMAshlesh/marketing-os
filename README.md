# Marketing OS — Launch Hub (MVP)

A single hub to schedule, launch, and monitor approved campaign content across
multiple channels — the MVP slice of the broader "Marketing OS" vision. Full
product thinking (problem frame, persona, scope, roadmap) lives in
[`outputs/`](outputs/).

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

## Demo script (reliably triggers both readiness flags)

1. From the dashboard, click **New Launch**.
2. Name: `Autumn Sale Launch`. Keep all 3 channels selected.
3. Email: any recipient address, any subject/body.
4. WhatsApp message: something **without** the word "stop"/"unsubscribe", e.g.
   `Autumn Sale is live, 30% off everything this week!`
   → triggers the compliance-keyword flag.
5. Social caption: anything. Set its **offset to 25** (minutes).
   → triggers the timing-skew flag (channels launching >10 min apart).
6. Submit → the Readiness Check screen shows both flags.
7. Click **Acknowledge** on each, then **Launch**.
8. Watch the Status Board hit **3/3 live** within a few seconds — the value
   moment. Go back to the dashboard to see it listed in history.

## Project structure
- `src/lib/types.ts` — data model
- `src/lib/store.ts` — in-memory data store, seed data, launch scheduler/ticker
- `src/lib/readiness.ts` — the readiness-check rule engine
- `src/lib/connectors.ts` — channel "sends" (real email, simulated WhatsApp/social)
- `src/app/api/launches/*` — REST-ish API routes
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
