import { randomUUID } from "crypto";
import {
  ChannelKey,
  ChannelOffsets,
  ChannelStatus,
  Launch,
  LaunchContent,
} from "./types";
import { evaluateReadiness } from "./readiness";
import { sendEmail, sendSocial, sendWhatsApp } from "./connectors";

const ALL_CHANNELS: ChannelKey[] = ["email", "whatsapp", "social"];

function idleStatus(): ChannelStatus {
  return { state: "idle", updatedAt: new Date().toISOString() };
}

function emptyChannelStatus(): Launch["channelStatus"] {
  return { email: idleStatus(), whatsapp: idleStatus(), social: idleStatus() };
}

class LaunchStore {
  launches: Map<string, Launch> = new Map();
  private tickerStarted = false;

  constructor() {
    this.seed();
    this.startTicker();
  }

  private seed() {
    const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();

    const seeded: Launch[] = [
      {
        id: randomUUID(),
        name: "Diwali Sale Kickoff",
        channels: ["email", "whatsapp", "social"],
        content: {
          email: {
            to: "customers@example.com",
            subject: "Our Diwali Sale is live — up to 40% off",
            body: "Celebrate with us: 40% off storewide, this week only.",
          },
          whatsapp: { message: "Diwali Sale is live! Up to 40% off. Reply STOP to unsubscribe." },
          social: { caption: "✨ Diwali Sale is here — up to 40% off storewide. Link in bio." },
        },
        offsets: { email: 0, whatsapp: 0, social: 0 },
        scheduledFor: null,
        createdAt: daysAgo(3),
        stage: "done",
        flags: [],
        channelStatus: {
          email: { state: "live", updatedAt: daysAgo(3), detail: "Delivered via Resend (historical)" },
          whatsapp: { state: "live", updatedAt: daysAgo(3), detail: "Simulated send" },
          social: { state: "live", updatedAt: daysAgo(3), detail: "Simulated post" },
        },
      },
      {
        id: randomUUID(),
        name: "Weekly Newsletter #42",
        channels: ["email", "social"],
        content: {
          email: {
            to: "subscribers@example.com",
            subject: "This week: new arrivals + community picks",
            body: "Here's what's new this week, hand-picked by the team.",
          },
          social: { caption: "New arrivals just dropped 👀 check the newsletter for our picks." },
        },
        offsets: { email: 0, social: 0 },
        scheduledFor: null,
        createdAt: daysAgo(6),
        stage: "done",
        flags: [],
        channelStatus: {
          email: { state: "live", updatedAt: daysAgo(6), detail: "Delivered via Resend (historical)" },
          whatsapp: idleStatus(),
          social: {
            state: "failed",
            updatedAt: daysAgo(6),
            detail: "Simulated failure — platform rate-limited this post (demo simulation).",
          },
        },
      },
      {
        id: randomUUID(),
        name: "Flash Sale — 2hr Window",
        channels: ["email", "whatsapp"],
        content: {
          email: {
            to: "vip@example.com",
            subject: "2 hours only: flash sale for VIPs",
            body: "You get first access — 2 hour flash sale starts now.",
          },
          whatsapp: { message: "VIP flash sale — 2 hours only! Reply STOP to unsubscribe." },
        },
        offsets: { email: 0, whatsapp: 0 },
        scheduledFor: null,
        createdAt: daysAgo(1),
        stage: "done",
        flags: [],
        channelStatus: {
          email: { state: "live", updatedAt: daysAgo(1), detail: "Delivered via Resend (historical)" },
          whatsapp: { state: "live", updatedAt: daysAgo(1), detail: "Simulated send" },
          social: idleStatus(),
        },
      },
    ];

    for (const launch of seeded) {
      this.launches.set(launch.id, launch);
    }
  }

  list(): Launch[] {
    return Array.from(this.launches.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  get(id: string): Launch | undefined {
    return this.launches.get(id);
  }

  create(input: {
    name: string;
    channels: ChannelKey[];
    content: LaunchContent;
    offsets: ChannelOffsets;
    scheduledFor: string | null;
  }): Launch {
    const flags = evaluateReadiness(input.channels, input.content, input.offsets);
    const launch: Launch = {
      id: randomUUID(),
      name: input.name,
      channels: input.channels,
      content: input.content,
      offsets: input.offsets,
      scheduledFor: input.scheduledFor,
      createdAt: new Date().toISOString(),
      stage: "review",
      flags,
      channelStatus: emptyChannelStatus(),
    };
    this.launches.set(launch.id, launch);
    return launch;
  }

  update(
    id: string,
    input: {
      name: string;
      channels: ChannelKey[];
      content: LaunchContent;
      offsets: ChannelOffsets;
      scheduledFor: string | null;
    }
  ): Launch | undefined {
    const existing = this.launches.get(id);
    if (!existing || existing.stage !== "review") return existing;

    const flags = evaluateReadiness(input.channels, input.content, input.offsets);
    const updated: Launch = {
      ...existing,
      name: input.name,
      channels: input.channels,
      content: input.content,
      offsets: input.offsets,
      scheduledFor: input.scheduledFor,
      flags,
    };
    this.launches.set(id, updated);
    return updated;
  }

  acknowledgeFlag(launchId: string, flagId: string): Launch | undefined {
    const launch = this.launches.get(launchId);
    if (!launch) return undefined;
    launch.flags = launch.flags.map((f) => (f.id === flagId ? { ...f, acknowledged: true } : f));
    return launch;
  }

  canLaunch(launch: Launch): boolean {
    return launch.flags.every((f) => f.acknowledged);
  }

  trigger(id: string): Launch | undefined {
    const launch = this.launches.get(id);
    if (!launch || launch.stage !== "review") return launch;
    if (!this.canLaunch(launch)) return launch;

    launch.stage = "launching";
    const isFuture = launch.scheduledFor && new Date(launch.scheduledFor).getTime() > Date.now();

    for (const channel of launch.channels) {
      launch.channelStatus[channel] = {
        state: isFuture ? "scheduled" : "pending",
        updatedAt: new Date().toISOString(),
      };
      if (!isFuture) {
        this.resolveChannel(launch, channel);
      }
    }
    this.maybeComplete(launch);
    return launch;
  }

  private resolveChannel(launch: Launch, channel: ChannelKey) {
    const send = async () => {
      let result: ChannelStatus;
      if (channel === "email") {
        result = await sendEmail(launch.content.email!);
      } else if (channel === "whatsapp") {
        result = await sendWhatsApp(launch.content.whatsapp!);
      } else {
        result = await sendSocial(launch.content.social!);
      }
      launch.channelStatus[channel] = result;
      this.maybeComplete(launch);
    };
    void send();
  }

  private maybeComplete(launch: Launch) {
    const relevant = launch.channels.map((c) => launch.channelStatus[c].state);
    const allResolved = relevant.every((s) => s === "live" || s === "failed");
    if (allResolved && launch.stage === "launching") {
      launch.stage = "done";
    }
  }

  private startTicker() {
    if (this.tickerStarted) return;
    this.tickerStarted = true;
    setInterval(() => {
      const nowMs = Date.now();
      for (const launch of Array.from(this.launches.values())) {
        if (launch.stage !== "launching" || !launch.scheduledFor) continue;
        if (new Date(launch.scheduledFor).getTime() > nowMs) continue;
        for (const channel of launch.channels) {
          if (launch.channelStatus[channel].state === "scheduled") {
            launch.channelStatus[channel] = { state: "pending", updatedAt: new Date().toISOString() };
            this.resolveChannel(launch, channel);
          }
        }
      }
    }, 1000);
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __marketingOsStore: LaunchStore | undefined;
}

export const store: LaunchStore = globalThis.__marketingOsStore ?? new LaunchStore();
globalThis.__marketingOsStore = store;

export function progressSummary(launch: Launch): { liveOrDone: number; total: number; label: string } {
  const total = launch.channels.length;
  const liveOrDone = launch.channels.filter(
    (c) => launch.channelStatus[c].state === "live"
  ).length;
  const failed = launch.channels.filter((c) => launch.channelStatus[c].state === "failed").length;

  if (launch.stage === "review") return { liveOrDone, total, label: "Awaiting review" };
  if (launch.stage === "launching") return { liveOrDone, total, label: `${liveOrDone}/${total} live` };

  if (failed > 0) return { liveOrDone, total, label: `${liveOrDone}/${total} live, ${failed} failed` };
  return { liveOrDone, total, label: `${liveOrDone}/${total} live` };
}

export { ALL_CHANNELS };
