# UX Flow — Marketing OS (Launch Hub MVP)

## User Story Backbone
```
[Prepare Launch] → [Check Readiness] → [Launch] → [Monitor]
   create launch      review AI flags     trigger      watch status board
   (name, channels,    fix/acknowledge     send         + launch history
    content, timing)
```
Entire backbone is in the MVP prototype slice — no future-scope tasks in this flow (planning/content-gen/measurement live outside it, per Concept & Scope).

## Job Stories
1. When I have approved content ready for multiple channels, I want to enter it once into a single launch instead of separate tools, so I can prepare a launch without tool-hopping.
2. When I'm about to launch across channels, I want the system to flag obvious problems (missing content, mistimed channels) before I commit, so I don't discover mistakes after it's too late.
3. When I hit launch, I want to trigger every channel from one action, so I don't log into each platform separately to fire it off.
4. When a launch is in progress or complete, I want one live status view of every channel's state, so I don't have to ping people or check each tool myself.
5. When I want to review past launches, I want a simple history list, so I have a record without digging through each channel's own reporting.

## Happy Path Flow (value moment at Step 6)
1. **Entry** — Priya opens Marketing OS → **Dashboard/Launch History** (shows past launches, or empty-state CTA)
2. She clicks **New Launch** → **New Launch Form**
3. She names the launch, selects channels (Email / WhatsApp / Social), enters one content field per channel, picks timing (Now or a future time)
4. She submits → **Readiness Check** screen runs and shows any flags (e.g. "WhatsApp message missing opt-out line," "Social scheduled 45 min before Email")
5. She fixes or acknowledges each flag; **Launch** button unlocks
6. She clicks **Launch** → **Status Board** appears; channels transition pending → live/scheduled/failed in real time. **VALUE MOMENT: she sees "3/3 channels live" confirmed in one place within seconds.**
7. She watches statuses settle without leaving the screen
8. She returns to **Dashboard/Launch History** → this launch now appears alongside past launches with its final status

## Screen / State List
| Screen | Purpose | Must/Should |
|---|---|---|
| Dashboard / Launch History | Entry point; list past launches with name, channels, overall status, time | Must |
| New Launch Form | Capture name, channel selection, per-channel content, timing | Must |
| Readiness Check | Show AI-generated flags; allow fix or acknowledge; gate the Launch action | Must |
| Status Board | Live per-channel status (pending/scheduled/live/failed) + overall progress | Must |
| Launch Detail | Single launch's content + final status (can be a state of Status Board, not a separate route) | Should |
| Login | Cosmetic single demo user | Should |

## Content & Data Requirements
**Launch record:** id, name, createdAt, scheduledFor, contentByChannel {email, whatsapp, social}, readinessFlags[], channelStatus {email, whatsapp, social} each with state + timestamp, overallStatus.

**Seed/mock data:** 2-3 pre-existing past launches in Dashboard on first load (varied: one fully live, one scheduled, one with a failed channel) so the demo never opens on a blank screen. One seeded "in-progress" example is authored so the Readiness Check *reliably* fires a flag live during the demo (not left to chance).

**Channel behavior:**
- Email → real send via a free-tier provider (Resend); status reflects the real API response (sent/failed)
- WhatsApp, Social → simulated: short randomized delay (~2-8s) then resolve to "live" (near-guaranteed success so the demo is reliable); code supports a "failed" state so the board doesn't look hard-coded to always succeed
- Readiness rules (minimum set): missing content field, timing skew between channels beyond a threshold, one keyword rule (e.g. WhatsApp copy must include an opt-out phrase) — evaluated client/server-side, optionally phrased through one LLM call for a natural-language flag message

## Edge Cases & Empty States
- **Empty dashboard:** before any launches exist — CTA "Create your first Launch"
- **Error state:** the real email send fails (e.g. unverified sender) → that channel shows "failed" with a short reason; the rest of the launch continues rather than the whole flow breaking
- **Success confirmation:** clicking Launch shows a brief "Launch started" confirmation before moving to the Status Board
