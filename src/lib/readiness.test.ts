import { describe, expect, it } from "vitest";
import { evaluateReadiness } from "./readiness";
import { ChannelKey, LaunchContent } from "./types";

const fullContent: LaunchContent = {
  email: { to: "a@b.com", subject: "Hi", body: "Body text" },
  whatsapp: { message: "Sale is live! Reply STOP to unsubscribe." },
  social: { caption: "Check out our sale" },
};

describe("evaluateReadiness", () => {
  it("returns no flags for complete, compliant content with aligned timing", () => {
    const channels: ChannelKey[] = ["email", "whatsapp", "social"];
    const flags = evaluateReadiness(channels, fullContent, { email: 0, whatsapp: 0, social: 0 });
    expect(flags).toHaveLength(0);
  });

  it("flags a missing email body/subject/recipient as a blocker", () => {
    const content: LaunchContent = { email: { to: "", subject: "", body: "" } };
    const flags = evaluateReadiness(["email"], content, {});
    expect(flags).toHaveLength(1);
    expect(flags[0].severity).toBe("blocker");
    expect(flags[0].channel).toBe("email");
  });

  it("flags an empty WhatsApp message as a blocker", () => {
    const content: LaunchContent = { whatsapp: { message: "" } };
    const flags = evaluateReadiness(["whatsapp"], content, {});
    expect(flags.some((f) => f.severity === "blocker" && f.channel === "whatsapp")).toBe(true);
  });

  it("flags an empty social caption as a blocker", () => {
    const content: LaunchContent = { social: { caption: "   " } };
    const flags = evaluateReadiness(["social"], content, {});
    expect(flags.some((f) => f.severity === "blocker" && f.channel === "social")).toBe(true);
  });

  it("warns when a WhatsApp message has no opt-out phrase", () => {
    const content: LaunchContent = { whatsapp: { message: "Sale is live, come check it out" } };
    const flags = evaluateReadiness(["whatsapp"], content, {});
    expect(flags.some((f) => f.severity === "warning" && f.message.toLowerCase().includes("opt-out"))).toBe(
      true
    );
  });

  it("does not warn about opt-out when the phrase is present, case-insensitively", () => {
    const content: LaunchContent = { whatsapp: { message: "Sale is live. reply stop to opt out." } };
    const flags = evaluateReadiness(["whatsapp"], content, {});
    expect(flags.some((f) => f.message.toLowerCase().includes("opt-out"))).toBe(false);
  });

  it("warns on a timing skew greater than 10 minutes between channels", () => {
    const flags = evaluateReadiness(["email", "social"], fullContent, { email: 0, social: 25 });
    expect(flags.some((f) => f.message.toLowerCase().includes("scheduled"))).toBe(true);
  });

  it("does not warn on a timing skew of 10 minutes or less", () => {
    const flags = evaluateReadiness(["email", "social"], fullContent, { email: 0, social: 10 });
    expect(flags.some((f) => f.message.toLowerCase().includes("scheduled"))).toBe(false);
  });

  it("does not evaluate timing skew for a single channel", () => {
    const flags = evaluateReadiness(["email"], fullContent, { email: 0 });
    expect(flags.some((f) => f.message.toLowerCase().includes("scheduled"))).toBe(false);
  });

  it("can raise multiple distinct flags at once", () => {
    const content: LaunchContent = {
      email: { to: "", subject: "", body: "" },
      whatsapp: { message: "Big sale starts now, don't miss it" },
    };
    const flags = evaluateReadiness(["email", "whatsapp"], content, { email: 0, whatsapp: 30 });
    // missing email content + whatsapp opt-out warning + timing skew warning
    expect(flags.length).toBeGreaterThanOrEqual(3);
  });
});
