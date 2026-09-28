# Lite PRD — Marketing OS: Launch Hub (MVP)

## Product Press Release
Today, Marketing OS launches its Launch Hub, helping campaign managers take approved content and get it live across every channel — email, WhatsApp, and social — in seconds instead of a scramble across five separate tools. Unlike today's fragmented martech stack, where a manager logs into each platform separately and then chases down confirmation that everything actually went out, Marketing OS lets you assemble one Launch, catches obvious mistakes before you commit, and shows a single trustworthy status board confirming every channel is live — no pinging, no tab-switching.

**FAQ**
1. **Who is this for?** Anyone coordinating a multi-channel campaign launch — a campaign/brand manager, or whoever ends up being the person responsible for getting content live everywhere.
2. **What problem does it solve that nothing else solves?** Each martech tool manages its own channel well, but nothing gives one person a single place to trigger and verify a launch across all of them at once — today that's done by hand, tool by tool.
3. **What does it do in the first 30 seconds?** You land on a dashboard of past launches, click New Launch, and start entering content per channel — no onboarding, no setup.
4. **What does it NOT do?** It doesn't write your content, doesn't manage approvals, doesn't touch real ad spend, and doesn't yet connect to production WhatsApp/social accounts — MVP uses one real free email send plus simulated WhatsApp/social channels to prove the mechanic.
5. **What would make this successful?** A campaign manager sees the demo and says "I'd use this on launch day even if only the email part is real right now."

## North Star Metric Card
- **North Star:** Time from "content approved" to "confirmed live across all channels" for one campaign
- **Leading Indicators:** (1) number of manual tool switches required to launch (target: 1, down from ~5); (2) number of readiness issues caught before launch vs. discovered after
- **Guardrail:** The status board must never show a channel as "live" when it did not actually succeed — trust in the status view is the entire value proposition
- **Demo Proxy:** The moment the Status Board shows "3/3 channels live" within seconds of clicking Launch

## Requirements Table

| # | Requirement | Given/When/Then | Priority | Screen |
|---|---|---|---|---|
| 1 | Single-entry launch creation across channels | Given I'm on the New Launch Form, when I select Email/WhatsApp/Social, fill one content field each plus name and timing, then the system creates a single Launch record holding all three channels' content | Must | New Launch Form |
| 2 | Pre-launch readiness check | Given a Launch has a missing field, a timing skew beyond threshold, or WhatsApp copy missing an opt-out phrase, when I submit the form, then the Readiness Check shows one flag per issue and disables Launch until each is fixed or acknowledged | Must | Readiness Check |
| 3 | One-action multi-channel trigger | Given a Launch passed the Readiness Check, when I click Launch, then all three connectors (1 real email send + 2 simulated) fire without further per-channel action | Must | Readiness Check → Status Board |
| 4 | Unified live status board | Given a Launch has been triggered, when each channel resolves, then its state (pending → live/failed) updates in real time with an overall "N/3 live" indicator, no page refresh needed | Must | Status Board |
| 5 | Launch history record | Given one or more Launches exist (seeded or created), when I open the Dashboard, then I see them listed by name/channels/status/time, most-recent first | Must | Dashboard |

## Screen / Module Manifest
| Screen | Purpose | Real vs. Mocked | Priority |
|---|---|---|---|
| Dashboard / Launch History | Entry point + history | Real records, seeded with 2-3 mock past launches | Must |
| New Launch Form | Capture launch inputs | Real form → real backend record | Must |
| Readiness Check | Show flags gating Launch | Real rule logic; flag phrasing may use one LLM call | Must |
| Status Board | Live per-channel status | Real for email (actual API result); simulated timed resolution for WhatsApp/Social | Must |
| Launch Detail | Full content + result for one launch | Real (can be a state within Status Board) | Should |
| Login | Cosmetic single demo user | Mocked | Should |

## Assumptions & Shortcuts
- WhatsApp and Social are fully simulated — no real WhatsApp Business API or social OAuth in MVP; they resolve to "live" after a short randomized delay.
- Email is the only real integration (Resend free tier); free-sandbox deliverability limits may cause real failures unrelated to product logic — shown honestly as "failed," not hidden.
- Readiness Check rules are simple (missing field, timing-skew threshold, one keyword rule) — a first pass, not a real compliance/legal engine.
- No real authentication — single demo user, no account system.
- Lightweight database only (e.g. SQLite or a free-tier hosted Postgres) — not built for production scale or multi-tenancy.
- Seed data is authored so the Readiness Check reliably fires a flag during a live demo, rather than depending on random live conditions.
- Campaign planning, content generation, approval workflows, and measurement/attribution are explicitly out of this build (parked for v1/v2 per Concept & Scope).

## Demo Success Definition
The demo succeeds if, live: a viewer watches a Launch get created with content for 3 channels, sees the Readiness Check catch a real issue and require it to be addressed, watches the Status Board go from all-pending to "3/3 channels live" within seconds of clicking Launch (with the email channel actually delivering), and can then find that same launch in the Dashboard afterward — without the presenter needing to explain anything away as fake, except the openly-acknowledged simulated WhatsApp/social sends.
