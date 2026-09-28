# Idea Pressure Test — Marketing OS

> No interviews have actually been run yet (solo, fast-build context). This is the test plan + a pre-mortem-driven honesty check, not validated results. Treat the Pivot Signals section as design guardrails for the MVP until real conversations happen.

## Pre-Mortem — "It's demo day and it flopped. Why?"
- Nobody manages campaigns this way — channels are permanently owned by separate specialist teams/agencies, so no single person ever has authority to schedule across all of them → **new assumption A6** below.
- It reads as "just a Buffer/Hootsuite clone with an AI label slapped on it" — no visible intelligence, so it doesn't land as "Marketing OS" → **new assumption A7**.
- The free/sandboxed channel integrations look obviously fake, undermining the "enterprise-ready" story → **new assumption A8**.
- The "weeks to days" headline claim gets challenged and the demo can't back it with anything beyond the execution-hub mechanic.

## Assumption Map (Critical × Evidence)

| Assumption | Critical? | Evidence | Quadrant |
|---|---|---|---|
| A1. Enterprise teams publish one campaign across 4+ separate channel tools | High | Moderate (well-documented martech-stack sprawl) | Monitor |
| A2. Manual cross-channel coordination is a real, felt time sink | High | None | **Test now** |
| A3. Campaign managers adopt a new layer if it saves time & doesn't replace existing tools | High | None | **Test now** |
| A4. "Weeks to days" is achievable via execution-friction removal alone | Medium | None | Deprioritize (narrative nice-to-have, not concept-breaking) |
| A5. A good demo is convincing evidence to a pitch audience | Medium | Strong (standard demo logic) | Accept, move on |
| A6. A single role has real authority to schedule across all channels (not siloed per specialist team) | High | None | **Test now** |
| A7. The MVP will read as meaningfully "AI/OS," not a generic scheduler clone | High | None | **Test now** |
| A8. Mocked/sandbox channel integrations will still feel credible in a live demo | Medium | None | Deprioritize (craft/execution risk, fixable in build, not concept-breaking) |

## Priority Assumptions (test before/while building)
1. **A6** — A single role (our persona) genuinely has cross-channel scheduling authority.
2. **A7** — The MVP will visibly differentiate as "orchestration/AI," not just a scheduling calendar.
3. **A2** — Manual coordination is a real, meaningfully painful time cost, not a minor annoyance.
4. **A3** — Campaign managers would actually adopt a layer like this.

## Experiment Cards

**Card 1 — A6 (role authority)**
- We believe: a Campaign/Brand Manager (or someone wearing that hat) typically has enough visibility/authority to schedule content across email, social, ads, and messaging for one campaign, rather than each channel being permanently siloed to a separate specialist team.
- To test it: 2-3 informal conversations with anyone in marketing/marketing-ops (colleagues, LinkedIn/marketing communities), plus a quick look at "campaign manager" / "marketing operations" job descriptions for cross-channel scheduling responsibility.
- Right if: at least 2 of 3 confirm they've held/seen a role that schedules across 3+ channels directly, not just briefs and hands off.
- Wrong if: people consistently describe channels as permanently owned by separate specialist teams with no coordinating role.
- Test cost: ~1-2 hours.

**Card 2 — A7 (AI/OS differentiation)**
- We believe: a live demo of "schedule once → launch across channels → one status view" will read as a differentiated orchestration/AI concept, not a generic scheduling clone.
- To test it: show a 2-minute walkthrough (wireframe or working screen) to 2-3 people and ask, unprompted, "what does this remind you of?"
- Right if: reactions mention orchestration, automation, or "connecting my whole stack."
- Wrong if: multiple people immediately compare it to existing generic schedulers with no sense of added intelligence.
- Test cost: ~30-45 min, once a rough UI exists.

**Card 3 — A2 (real time sink)**
- We believe: manually reconciling cross-channel launch timing/status is a real, meaningfully painful cost — not something people have already made peace with.
- To test it: ask 2-3 marketing-adjacent contacts to describe their actual launch-day routine, or scan first-hand complaints in reviews/forums for tools like Hootsuite/Sprout/HubSpot about cross-channel status visibility.
- Right if: people spontaneously describe manual status-checking or cross-tool reconciliation as a specific frustration.
- Wrong if: people say launch-day coordination is a non-issue, already well solved by their stack.
- Test cost: ~1 hour.

## Mentor / Reviewer Question Set
1. Does one person really have authority to schedule across email, social, ads, and messaging for a campaign — or is that always split across specialist teams?
2. What's the most painful part of launch day when a campaign goes out across multiple channels at once?
3. Have you seen tools try to unify cross-channel scheduling before? What broke down, or why didn't it stick?
4. If shown a single dashboard that schedules and confirms launch status across 3 channels, does that feel like a real product or a demo trick?
5. What would make you trust a "status: live" indicator here versus checking the channel yourself?
6. Where does AI actually add value in this flow, versus being a label on a scheduling tool?
7. What would need to be true about integration effort/pricing for an enterprise team to actually adopt this?

## Pivot Signals
- **Concept pivot:** Reviewers consistently say no single role has cross-channel scheduling authority (A6 fails) → reframe as a cross-team coordination/approval tool, or retarget the persona to a marketing-ops lead who coordinates rather than executes.
- **Scope change:** Pain is confirmed but centers on *visibility*, not *execution* → narrow the MVP to a unified, read-only status dashboard rather than a full scheduling/launch hub.
- **Messaging/framing change:** People like the mechanic but call it "just a scheduler" (A7 fails) → keep the mechanic, but make sure the MVP includes at least one clearly AI-driven behavior (e.g., auto-flagging a cross-channel timing conflict) so the "AI/OS" positioning is earned, not just labeled.
- **No change:** Reviewers confirm the role exists, describe real coordination pain, and react to a demo mock with genuine interest in the unification → proceed as scoped.

## Design Guardrail Carried Into Concept & Scope
Because A6 and A7 are untested and concept-threatening, the MVP scope should bake in a cheap mitigation rather than waiting for a formal test:
- Keep the persona framing flexible enough to still make sense if the actual user is "whoever coordinates the launch" rather than a literal single job title.
- Include at least one small, visibly intelligent behavior (not just scheduling/display) so the demo doesn't read as a plain calendar/scheduler.
