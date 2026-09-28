# v1 Build Notes — what was actually built vs. the v1 roadmap

The v1 roadmap in [`../05-concept-scope/concept-scope.md`](../05-concept-scope/concept-scope.md)
("Add the content + trust layer") listed five items. This pass built three of
them, in a deliberately lighter form than a full production build, to stay
consistent with the project's $0 / fast-build principles.

## Built

1. **AI content drafting from a brief** — a "Draft with AI" box on the New
   Launch form generates per-channel content from a one-line brief.
   Implemented in [`src/lib/ai.ts`](../../src/lib/ai.ts): calls Claude
   (`claude-haiku-4-5-20251001`) if `ANTHROPIC_API_KEY` is set, otherwise
   falls back to a deterministic template — same zero-cost-by-default pattern
   as the email connector. **This is the one feature in the app that costs
   real money if you opt into the real API call** — flagged explicitly here
   and in the code comment, since it's a deliberate exception to the "genuinely
   free" MVP principle, not an oversight.
2. **Lightweight approval step** — each channel's content now has an
   approval status (pending/approved/rejected). Launch is blocked until every
   selected channel is approved; editing content resets all approvals to
   pending (content changed → prior sign-off no longer applies).
3. **A basic "second persona" in the demo** — instead of building real
   multi-user auth (explicitly cut, see below), a client-side role switcher
   ("Viewing as: Campaign Manager / Approver") in the header lets one person
   demo both sides of the approval workflow without a login system.

## Built in a lighter form than planned
- **"Real chat-based AI agent for natural-language status queries"** became
  a simple **Ask box** on the Status Board: same real-Claude-or-fallback
  pattern as drafting, answering from the launch's own status data. It's a
  single Q&A turn, not a persistent conversational agent — sufficient to
  demo the "AI/OS" positioning without the added build time of real
  multi-turn state.

## Not built this pass (still parked)
- **Real multi-user auth** — the role switcher above is a demo device, not
  auth. No login, no accounts, no server-side identity. Anyone can switch
  roles and act as either persona.
- **Upgrading 1-2 more connectors to real free-tier APIs** (e.g. a real
  WhatsApp Cloud API sandbox number) — this requires the user's own account
  setup (business verification, phone number, developer app registration),
  which isn't something to do autonomously. WhatsApp and Social remain
  simulated.

## Why these cuts
Real auth and real second/third channel integrations both require the user's
own account creation and credentials — appropriately outside what should be
done without asking. Everything that *could* be built with zero new external
accounts was built; everything that needed the user to go create an account
somewhere was left as a clearly-flagged next step instead of blocked on or
guessed at.
