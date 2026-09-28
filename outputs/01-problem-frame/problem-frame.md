# Problem Frame — Marketing OS

> **Hero slice decision (confirmed with user):** Multi-channel **execution hub** — not content generation/approval. Primary user: Campaign/Brand Manager.

## JTBD Statement
When I have approved campaign content ready to go out, I want to schedule and launch it across all my marketing channels (email, social, ads, WhatsApp/SMS, web) from one place instead of logging into five separate platforms, so I can launch faster, keep timing coordinated, and see one true status of what's live versus scheduled versus stuck.

*(Primary user: Campaign/Brand Manager at a mid-large enterprise, coordinating a launch across channel-owning teams/tools.)*

## HMW Statement
How might we give a campaign manager one hub to schedule, launch, and monitor approved content across every channel they use — without replacing the channel tools (ESP, social, ad platform) already in place?

## Pain/Gain Map

**Pains**
- Publishing one campaign means logging into 4-5+ separate tools (ESP, social scheduler, ad platform, CMS, WhatsApp/SMS) one at a time `[assumed]`
- No single calendar or status view of what's live, scheduled, or failed across channels — status lives in each tool separately `[assumed]`
- Coordinating simultaneous timing across channels (e.g., email + social + web go live together) requires manual cross-checking `[assumed]`
- A last-minute content or timing change has to be re-applied by hand in every channel tool, risking inconsistency `[assumed]`
- No single control to pause or roll back a campaign across all channels at once if something goes wrong `[assumed]`
- Execution status has to be manually compiled and reported to stakeholders after the fact `[assumed]`

**Gains**
- One hub to schedule, launch, pause, and monitor a campaign across every channel
- Single unified status view — live / scheduled / failed / blocked — no tool-hopping
- Channels launch in coordinated fashion without manual cross-checking
- Time from "content approved" to "live everywhere" drops from hours of manual work to minutes
- Real-time status trail stakeholders can see directly, no manual reporting

## Problem Boundaries

**In scope for this sprint:** orchestrating the scheduling/launch/monitoring of **already-approved** content across multiple channels from one interface, for one campaign at a time, within a single marketing team.

**Explicitly out of scope:**
- Generating or approving content — this hub assumes content arrives already approved (upstream stage, candidate for v1)
- Replacing existing channel tools (ESP, social platform, ad platform) — orchestrate/integrate on top of them, don't rebuild them
- Multi-brand / multi-market enterprise governance
- Fully autonomous AI agents spending real ad budget or sending to real customer lists (MVP uses sandbox/free-tier or mocked channel integrations — see constraint below)
- Deep BI, attribution modeling, or media-mix optimization

**Not solved this sprint (parked for v1/v2):** the other problem areas named in the original pitch — campaign *planning* (calendars, budget allocation), AI-assisted *content creation and approval*, and closed-loop *measurement*/attribution feeding back into the next brief. This frame treats the execution hub as the sprint's hero slice and the natural spine to attach planning, content, and measurement onto in later phases.

**Free-tooling constraint:** MVP channel "sends" will use free-tier/sandbox APIs or simulated channels (e.g., a mock social feed, a free email API, a WhatsApp sandbox) rather than paid enterprise integrations — this is a delivery constraint on top of the problem, not a redefinition of it.

## Assumption Register
- Enterprise marketing teams routinely publish one campaign across 4+ separate channel tools `[weak signal]`
- Manually coordinating cross-channel timing/status is a real, felt time sink for campaign managers (more than e.g. content creation itself) `[no evidence]`
- Campaign managers will adopt a new orchestration layer if it visibly saves coordination time and doesn't require abandoning existing channel tools `[assumed]`
- "Weeks to days" is partly achievable just by removing execution/status-tracking friction, even before AI-generated content or planning are added `[assumed]`
- A demo of "approve once, launch everywhere, see one status view" is convincing evidence of the broader "Marketing OS" vision to a stakeholder/pitch audience `[assumed]`

## Success Signal
In a demo, a campaign manager takes one piece of approved content and schedules/launches it simultaneously across 3 channels (e.g. email + WhatsApp/SMS + a social feed) from a single hub, then watches a unified status view update in real time (live/scheduled/failed) — versus doing this manually per platform — and says this would save them real coordination time in their actual job.
