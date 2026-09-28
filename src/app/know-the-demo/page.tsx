import { WorkflowDiagram } from "@/components/WorkflowDiagram";

export default function KnowTheDemoPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 text-2xl font-semibold tracking-tight">How this actually works</h1>
      <p className="mb-8 text-sm leading-relaxed text-slate-600">
        Most marketing teams don&apos;t have one campaign problem, they have a
        five-tool problem. The brief lives in a doc somewhere, the copy gets
        argued about over email, someone signs off in a Slack thread, and then
        you&apos;re logged into four different platforms hitting send one at
        a time, hoping you didn&apos;t mess up the timing. This page walks
        through what this app does about it, using the actual flow it runs,
        not a slideshow version of it.
      </p>

      <WorkflowDiagram />

      <div className="mt-10 space-y-8">
        <Section title="Brief">
          You write one line. Not a full creative brief, just what&apos;s
          happening and what the offer is, enough for a first pass.
        </Section>

        <Section title="AI draft">
          That line goes to Claude, which writes a first version for every
          channel you picked: email subject and body, a WhatsApp message, a
          social caption. If there&apos;s no API key set up, it still works,
          just with plain template copy instead. Either way, you&apos;re
          editing it before anything goes out, not shipping it blind.
        </Section>

        <Section title="Approve">
          Someone other than whoever wrote it has to sign off, channel by
          channel. In this demo that&apos;s the role switcher in the top bar,
          flip it to Approver to see the other side. On a real team this
          would be whoever owns brand or legal.
        </Section>

        <Section title="Readiness check">
          Before launch, the app checks a few things nobody remembers to
          check by hand: is any channel&apos;s content actually filled in, is
          one channel scheduled way earlier than the rest, does the WhatsApp
          message have an opt-out line in it. Small stuff, but it&apos;s the
          kind of small stuff that gets missed at 6pm right before a launch.
        </Section>

        <Section title="Launch">
          One click, and all channels fire at once instead of you doing it
          one browser tab at a time.
        </Section>

        <Section title="Status">
          Each channel reports back for real. Email actually sends if
          you&apos;ve set up a Resend key, and simulates it convincingly if
          you haven&apos;t. WhatsApp and social are simulated for now:
          hooking those up for real means business accounts and API
          approvals we didn&apos;t want to make you go get just to look at a
          demo. You get one screen that tells you what&apos;s live instead of
          texting three people to ask if their part went out.
        </Section>

        <Section title="What's actually real right now">
          Worth being straight about this: email is the only channel that
          can genuinely send something. WhatsApp and social are simulated
          well enough to demo convincingly, but they&apos;re not wired into
          real accounts. The AI drafting works with a real Claude call if
          you add an API key, and with a template if you don&apos;t. Either
          way you&apos;re meant to edit before you launch, not trust it
          blindly. None of this is hidden. It&apos;s a deliberate choice
          about where to spend the time on a first version, not a corner we
          forgot about.
        </Section>

        <Section title="One more thing">
          The login on this app is a demo gate, not real security. The code
          is 3141, the first four digits of pi. We&apos;re not protecting
          anything sensitive here, just making it feel like something you
          sign into rather than a public page.
        </Section>

        <Section title="What's next">
          Right now this covers one thing: getting approved content live
          across channels without the busywork. Planning a campaign, real
          approval chains, and pulling performance data back in are the next
          parts, not this one.
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-1.5 text-sm font-semibold text-slate-800">{title}</h2>
      <p className="text-sm leading-relaxed text-slate-600">{children}</p>
    </div>
  );
}
