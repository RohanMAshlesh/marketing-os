import { beforeEach, describe, expect, it, vi } from "vitest";
import { store } from "./store";
import { LaunchContent } from "./types";

const validContent: LaunchContent = {
  email: { to: "a@b.com", subject: "Hi", body: "Body" },
};

beforeEach(() => {
  store.resetForTests();
});

describe("store.create", () => {
  it("starts a new launch in review with every selected channel pending approval", () => {
    const launch = store.create({
      name: "Test Launch",
      channels: ["email"],
      content: validContent,
      offsets: { email: 0 },
      scheduledFor: null,
    });
    expect(launch.stage).toBe("review");
    expect(launch.channelApprovals.email.status).toBe("pending");
  });

  it("runs the readiness engine on creation", () => {
    const launch = store.create({
      name: "Missing content",
      channels: ["email"],
      content: { email: { to: "", subject: "", body: "" } },
      offsets: { email: 0 },
      scheduledFor: null,
    });
    expect(launch.flags.length).toBeGreaterThan(0);
  });
});

describe("store.canLaunch / store.trigger gating", () => {
  it("blocks launch when a channel is still pending approval, even with no readiness flags", () => {
    const launch = store.create({
      name: "Needs approval",
      channels: ["email"],
      content: validContent,
      offsets: { email: 0 },
      scheduledFor: null,
    });
    expect(launch.flags).toHaveLength(0);
    expect(store.canLaunch(launch)).toBe(false);

    const result = store.trigger(launch.id);
    expect(result?.stage).toBe("review"); // unchanged, trigger refused
  });

  it("blocks launch when a readiness flag is unacknowledged, even if approved", () => {
    const launch = store.create({
      name: "Needs ack",
      channels: ["whatsapp"],
      content: { whatsapp: { message: "Big sale starts now" } },
      offsets: { whatsapp: 0 },
      scheduledFor: null,
    });
    store.setApproval(launch.id, "whatsapp", "approved");
    expect(store.canLaunch(store.get(launch.id)!)).toBe(false);
  });

  it("allows launch once every channel is approved and every flag acknowledged", () => {
    const launch = store.create({
      name: "Ready to go",
      channels: ["email"],
      content: validContent,
      offsets: { email: 0 },
      scheduledFor: null,
    });
    store.setApproval(launch.id, "email", "approved");
    const updated = store.get(launch.id)!;
    expect(store.canLaunch(updated)).toBe(true);

    const triggered = store.trigger(launch.id);
    expect(triggered?.stage).toBe("launching");
    expect(triggered?.channelStatus.email.state).toBe("pending");
  });

  it("editing a launch resets every channel's approval back to pending", () => {
    const launch = store.create({
      name: "Will be edited",
      channels: ["email"],
      content: validContent,
      offsets: { email: 0 },
      scheduledFor: null,
    });
    store.setApproval(launch.id, "email", "approved");
    expect(store.get(launch.id)!.channelApprovals.email.status).toBe("approved");

    store.update(launch.id, {
      name: "Will be edited",
      channels: ["email"],
      content: { email: { to: "a@b.com", subject: "New", body: "New body" } },
      offsets: { email: 0 },
      scheduledFor: null,
    });
    expect(store.get(launch.id)!.channelApprovals.email.status).toBe("pending");
  });

  it("a rejected channel blocks launch until re-approved", () => {
    const launch = store.create({
      name: "Rejected once",
      channels: ["email"],
      content: validContent,
      offsets: { email: 0 },
      scheduledFor: null,
    });
    store.setApproval(launch.id, "email", "rejected", "wrong tone");
    expect(store.canLaunch(store.get(launch.id)!)).toBe(false);

    store.setApproval(launch.id, "email", "approved");
    expect(store.canLaunch(store.get(launch.id)!)).toBe(true);
  });
});

describe("store.trigger end-to-end resolution", () => {
  it("resolves every channel to live/failed and marks the launch done", async () => {
    vi.useFakeTimers();
    try {
      const launch = store.create({
        name: "Full run",
        channels: ["email", "whatsapp", "social"],
        content: {
          email: { to: "a@b.com", subject: "Hi", body: "Body" },
          whatsapp: { message: "Sale! Reply STOP to unsubscribe." },
          social: { caption: "Sale caption" },
        },
        offsets: { email: 0, whatsapp: 0, social: 0 },
        scheduledFor: null,
      });
      store.setApproval(launch.id, "email", "approved");
      store.setApproval(launch.id, "whatsapp", "approved");
      store.setApproval(launch.id, "social", "approved");

      store.trigger(launch.id);
      // let every simulated connector's delay() timer fire
      await vi.advanceTimersByTimeAsync(10_000);

      const final = store.get(launch.id)!;
      expect(final.stage).toBe("done");
      for (const channel of final.channels) {
        expect(["live", "failed"]).toContain(final.channelStatus[channel].state);
      }
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("store.list", () => {
  it("orders launches most-recent first", () => {
    const older = store.create({
      name: "Older",
      channels: ["email"],
      content: validContent,
      offsets: {},
      scheduledFor: null,
    });
    // force a distinguishable, earlier createdAt
    older.createdAt = new Date(Date.now() - 60_000).toISOString();

    store.create({
      name: "Newer",
      channels: ["email"],
      content: validContent,
      offsets: {},
      scheduledFor: null,
    });

    const names = store.list().map((l) => l.name);
    expect(names.indexOf("Newer")).toBeLessThan(names.indexOf("Older"));
  });
});
