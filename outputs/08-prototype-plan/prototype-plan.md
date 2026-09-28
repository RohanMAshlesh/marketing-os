# Prototype Plan — Marketing OS: Launch Hub (MVP)

## Prototype Question
Does a single hub that lets someone schedule, launch, and monitor approved content across 3 channels — with one visible, intelligent readiness check — feel trustworthy and clearly differentiated (not "just a scheduler"), enough that a viewer would want it for a real launch?

## Prototype Type & Fidelity
**Medium-high fidelity, fully coded, functional prototype** with one real integration and two simulated ones. Rationale: the core thing being tested is trust in the mechanic (does the status board feel real, does the readiness check feel smart) — a clickable wireframe can't demonstrate live status transitions or a real send, and full production build is unnecessary and slower than needed.

What's sacrificed: production-grade auth, persistence, and real WhatsApp/social integrations — all explicitly acceptable per the PRD's Assumptions & Shortcuts.

## Stack Selection
- **Next.js (App Router, TypeScript)** — one app for both UI and API routes (Route Handlers), fastest path for a solo build, matches this environment's Vercel-oriented tooling for a free deploy if wanted later.
- **Tailwind CSS + shadcn/ui components** — fast to get a clean, coherent look without hand-building a design system.
- **Data layer: in-memory store (server-side singleton module), reseeded on boot.** Chosen over SQLite/hosted Postgres to avoid any account setup or file-persistence complexity — genuinely $0, zero config. Tradeoff (documented, already flagged in the PRD): state resets on server restart; acceptable since seed data reseeds automatically and the demo runs within one continuous session (`next dev`, or a single warm Vercel instance for a live-controlled demo).
- **Email: Resend free tier** — one real API call, minimal setup (single API key).
- **Readiness Check "AI" logic: deterministic rule engine, not a live LLM call.** Decision made here (not asked again) to keep the MVP at true $0 cost and zero live-demo latency/failure risk from an external AI API. The differentiation from "just a scheduler" comes from the *behavior* (proactively catching cross-channel issues before launch), not from LLM-generated prose. A real LLM call to phrase flags more naturally is a trivial, clearly-scoped v1 upgrade once an API budget exists.
- **Status updates: client-side polling** (e.g., every 1.5s) against a status endpoint — simpler and more demo-reliable than WebSockets/SSE for this scope.

## Real vs. Mocked Map
| Component | Real / Mocked | Notes |
|---|---|---|
| New Launch Form | Real | Actual form, validated, posts to a real API route |
| Readiness Check rules | Real | Deterministic: missing field, timing-skew threshold, one keyword rule |
| Readiness flag phrasing | Mocked (templated) | No live LLM call in MVP — see stack rationale |
| Email channel | Real | Resend API call, real success/failure reflected |
| WhatsApp channel | Mocked | Code-simulated: short randomized delay, resolves to live (rare simulated failure path retained in code) |
| Social channel | Mocked | Same simulation pattern as WhatsApp |
| Status Board | Real | Polls real in-memory state; not faked |
| Dashboard / Launch History | Real | Real records, seeded with 2-3 authored past launches |
| Login | Cut for MVP | No login screen at all — single implicit demo user, saves build time with zero demo cost |

## Build Order (Must-Haves first, ~6-7 focused hours total, well within a single fast build)
1. Scaffold Next.js + Tailwind/shadcn, git init, base layout/nav — **30-45 min**
2. In-memory data layer: Launch type, store, seed data — **30 min**
3. Dashboard screen wired to store + seed data — **30-45 min**
4. New Launch Form + create-launch API route — **45-60 min**
5. Readiness Check rules + screen (gates Launch) — **45-60 min**
6. Launch trigger + 3 channel connectors (real email + 2 simulated) + status transition engine — **60-90 min** *(core mechanic)*
7. Status Board screen with polling + overall progress — **45-60 min** *(value moment — extra polish here)*
8. Confirm Dashboard reflects new launches (should mostly fall out of shared store) — **15 min**
9. Empty state, one error state (email failure), success confirmation toast — **30 min**
10. Author seed data so the Readiness Check reliably fires a flag live, final polish pass — **30 min**
11. End-to-end manual run of the full happy path, fix bugs — **30-45 min**

Should-Haves (pause/rollback control) only if time remains after the above.

## Wizard of Oz Scripts
**None needed.** WhatsApp and Social are *code*-simulated (timed auto-resolution logic), not manually operated by a hidden human during the demo — there is no live wizard role to script or rehearse.

## BML Loop Definition
- **Build question:** Does this hub feel trustworthy and clearly more than "just a scheduler" to someone watching it live?
- **Measure method:** Live walkthrough shown to the user, and ideally the 1-2 informal marketing-adjacent conversations already planned in the Idea Pressure Test's Experiment Cards; ask the prepared mentor questions, especially "does this feel like a real product or a demo trick?" and "where does AI actually add value here?"
- **Learn criteria:**
  - **Persist as scoped** if reactions mention trust/orchestration/"I'd use this," with no one calling it a generic scheduler.
  - **Adjust framing** if reviewers call it "just a calendar" (A7 risk materializing) → make the Readiness Check more central to the demo narrative, or add a second small intelligent behavior in v1.
  - **Reprioritize v1** if reviewers say the real pain is elsewhere (e.g., content creation, not execution) → pull AI content drafting forward in the roadmap.
