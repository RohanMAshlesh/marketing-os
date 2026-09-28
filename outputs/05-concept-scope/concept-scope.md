# Concept & Scope — Marketing OS

## Concept Decision
**Selected concept: "Launch Hub"** — a single dashboard where a campaign manager assembles a *Launch* (one campaign's already-approved content, one item per channel), schedules it, and watches a unified live status board confirm every channel fired — with one built-in AI behavior (a pre-launch risk check) so the MVP reads as an intelligent orchestration layer, not a plain scheduler.

**Why this concept:**
- Directly answers the confirmed HMW (schedule/launch/monitor across channels from one place)
- Buildable entirely on free-tier/mocked infrastructure — no paid APIs, no enterprise integration approvals needed
- Has a clean, linear demo story completable in under 4 minutes
- The pre-launch AI check is a cheap, concrete mitigation for the A7 risk ("just a Buffer clone") flagged in the pressure test, without requiring a chat-bot or heavy ML pipeline

## Opportunity Solution Tree (lite)

```
Desired Outcome: Campaign manager launches an approved campaign across all
channels in a coordinated, verified way without manual reconciliation.
│
├── Opportunity 1: Reduce tool-hopping to schedule content per channel
│     ├── Solution A: Single scheduling form covering N channels  ← SELECTED
│     └── Solution B: Browser extension auto-filling each channel's own tool ← cut (fragile, no demo edge)
│
├── Opportunity 2: Provide one trustworthy live status view across channels
│     ├── Solution C: Central status board fed by channel connectors  ← SELECTED
│     └── Solution D: Manual refresh of each channel's own reporting  ← cut (defeats the trust goal)
│
├── Opportunity 3: Make it feel like an "AI/OS," not a plain calendar
│     ├── Solution E: Pre-launch readiness/conflict check (rule + light LLM)  ← SELECTED
│     └── Solution F: Chat-based AI assistant for status Q&A  ← deferred to v1
│
├── Opportunity 4 (parked): AI content generation + approval  → v1
├── Opportunity 5 (parked): Campaign planning / calendar / budget → v1–v2
└── Opportunity 6 (parked): Measurement / attribution feedback loop → v2
```

## Hero Use Case
**Priya has an approved campaign** with content ready for 3 channels (email, WhatsApp, social). She opens Marketing OS, creates a new Launch, adds the 3 channel items and a launch time. The system runs a pre-launch check and flags an issue (e.g., a timing mismatch or a missing field). She fixes it and hits Launch. The status board updates live as each channel fires — she sees **"3/3 channels live"** confirmed in one place within seconds, without checking anything else. *(~3 minute demo, single persona, single screen flow.)*

## MoSCoW Feature List — MVP

**Must Have** (core of the hero use case; must be genuinely built and working live)
- Create a **Launch**: name, pick channels, one content field per channel
- 3 channel connectors: **1 real free-tier integration (email, e.g. Resend/SendGrid free tier)** + **2 simulated connectors** (WhatsApp, social) — real email is deliberately kept so the demo isn't 100% fake (mitigates the A8 "looks like a toy" risk cheaply)
- Launch trigger: "Launch now" or schedule a future time
- **Unified status board**: per-channel state (pending / scheduled / live / failed), updating live in one view
- **Pre-launch AI check**: scans the Launch for obvious issues (missing content, timing skew across channels, a simple compliance-keyword rule) and shows flags before Launch is allowed — this is the feature that answers the "just a scheduler" risk
- Launch history list (past launches + final status) — cheap, and needed so it reads as a real product, not a one-shot demo screen

**Should Have** (build only once Must Haves work end-to-end)
- Pause/rollback control on an in-flight Launch
- Seeded demo data that reliably triggers the AI check during a live demo (don't rely on live-model variance for the money moment)
- Minimal single-user login (cosmetic — no real multi-tenant)

**Could Have** (only if time remains; mock the visuals, don't over-engineer)
- A 4th simulated channel (e.g., "Ads") purely for a richer-looking status board
- Toast/activity log ("Email fired at 10:02am")
- A stub chat box for asking the AI "what's the status of my launch?" (real version is v1's Solution F)

**Won't Have (this sprint)** — see Out-of-Scope Declaration below

## Impact / Effort Placement
- **High impact / low effort (build):** Launch creation form, 2 simulated connectors, unified status board, launch history
- **High impact / high effort → simplified:** pre-launch AI check — minimum version is a few rule checks (missing field, timing skew, one keyword rule) with a single LLM call to phrase the flag in plain language, not a full risk-model pipeline
- **Low impact / low effort (maybe):** activity toast log, 4th simulated channel
- **Low impact / high effort (cut):** real WhatsApp Business API / verified social OAuth posting, full approval-chain engine

## Cut Register
| Cut | Why |
|---|---|
| Browser extension that auto-fills each channel's native tool | Fragile, high build risk, no demo advantage over a native form |
| Chat-based AI assistant for status Q&A | Compelling but not required to prove the core mechanic; adds live-demo LLM-reliability risk — moved to v1 |
| Real paid channel APIs (WhatsApp Business API, Meta/Google Ads, verified social OAuth) | Violates the $0 + fast-build constraint (business verification, approval lead times); mocked connectors deliver equivalent demo value |
| Full content-creation + approval workflow | Belongs to a different opportunity (already out-of-scope per the Problem Frame); it's the anchor of v1, not MVP |
| Multi-tenant auth / roles / permissions | Engineering overhead with no payoff for a single-persona demo walkthrough |

## Out-of-Scope Declaration (MVP)
This sprint does **not** build: AI content generation, approval/legal workflows, campaign planning or budget tools, real paid/verified channel integrations, measurement/attribution/reporting, multi-tenant accounts or role-based permissions, or a mobile app. The MVP is a **single-user, single-team demo of the execution-hub mechanic**, using one real free-tier integration (email) and simulated connectors for the rest, running at $0 infrastructure cost.

---

## Phased Roadmap (as requested: MVP → v1 → v2)

### MVP (this sprint)
Execution/Launch Hub as scoped above: schedule → launch → monitor already-approved content across 3 channels (1 real + 2 simulated), unified status board, pre-launch AI risk check. Runs entirely on free tiers; solo-buildable in days.

### v1 — "Add the content + trust layer"
- AI content drafting: generate channel-specific copy variants from one brief (free-tier/low-cost LLM call)
- Lightweight approval step: single approve/reject state per channel item before it's launch-eligible (no complex approval chains yet)
- Real chat-based AI agent for natural-language status queries (Opportunity 3 / Solution F, deferred from MVP)
- Upgrade 1-2 more connectors from simulated to real free-tier (e.g. a real sandbox WhatsApp number, a real Slack channel as a stand-in "channel")
- Basic multi-user auth (e.g., manager + approver, so more than one persona shows up in the demo)

### v2 — "Add planning, measurement, and enterprise readiness"
- Campaign planning layer: calendar/timeline across multiple Launches, basic budget/resource fields
- Measurement feedback loop: pull simple performance signals (opens/clicks for email, mock engagement elsewhere) back into a campaign summary that informs the next brief
- Real paid/verified channel integrations for production use (WhatsApp Business API, ad platforms, verified social OAuth)
- Multi-brand/multi-team support, roles & permissions, audit trail
- Deeper agent autonomy: proposes optimal send times, auto-resolves simple conflicts, learns across campaigns

This keeps the original four-part vision (planning, content, execution, measurement) intact — the MVP proves the *execution* spine, and v1/v2 attach content-creation and planning/measurement onto the same Launch data model rather than starting over.
