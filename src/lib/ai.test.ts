import { beforeEach, describe, expect, it } from "vitest";
import { answerLaunchQuestion, draftContent } from "./ai";
import { Launch } from "./types";

beforeEach(() => {
  delete process.env.ANTHROPIC_API_KEY;
});

describe("draftContent (template fallback, no API key)", () => {
  it("drafts content only for the requested channels", async () => {
    const content = await draftContent("Spring sale, 20% off", ["email", "social"]);
    expect(content.email).toBeDefined();
    expect(content.social).toBeDefined();
    expect(content.whatsapp).toBeUndefined();
  });

  it("includes an opt-out phrase in the WhatsApp template so it doesn't trip its own readiness rule", async () => {
    const content = await draftContent("Flash sale today", ["whatsapp"]);
    expect(content.whatsapp?.message.toLowerCase()).toContain("stop");
  });

  it("uses the brief as the email subject line", async () => {
    const content = await draftContent("Big launch tomorrow", ["email"]);
    expect(content.email?.subject).toContain("Big launch tomorrow");
  });
});

describe("answerLaunchQuestion (rule-based fallback, no API key)", () => {
  function launchWith(overrides: Partial<Launch["channelStatus"]>): Launch {
    return {
      id: "l1",
      name: "Test",
      channels: ["email", "whatsapp"],
      content: {},
      offsets: {},
      scheduledFor: null,
      createdAt: new Date().toISOString(),
      stage: "done",
      flags: [],
      channelApprovals: { email: { status: "approved" }, whatsapp: { status: "approved" }, social: { status: "approved" } },
      channelStatus: {
        email: { state: "live", updatedAt: new Date().toISOString() },
        whatsapp: { state: "failed", updatedAt: new Date().toISOString(), detail: "timed out" },
        social: { state: "idle", updatedAt: new Date().toISOString() },
        ...overrides,
      },
    };
  }

  it("reports which channels failed when asked", async () => {
    const answer = await answerLaunchQuestion(launchWith({}), "did anything fail?");
    expect(answer.toLowerCase()).toContain("whatsapp");
  });

  it("says nothing failed when nothing did", async () => {
    const launch = launchWith({
      whatsapp: { state: "live", updatedAt: new Date().toISOString() },
    });
    const answer = await answerLaunchQuestion(launch, "did anything fail?");
    expect(answer.toLowerCase()).toContain("no channels have failed");
  });

  it("reports live/total status when asked", async () => {
    const answer = await answerLaunchQuestion(launchWith({}), "what's the status?");
    expect(answer).toContain("1/2");
  });
});
