import { ChannelKey, LaunchContent, ChannelOffsets, ReadinessFlag, CHANNEL_LABELS } from "./types";

const TIMING_SKEW_THRESHOLD_MINUTES = 10;
const OPT_OUT_PATTERN = /stop|unsubscribe|opt.?out/i;

let flagCounter = 0;
function nextFlagId(): string {
  flagCounter += 1;
  return `flag_${Date.now()}_${flagCounter}`;
}

function isChannelContentMissing(channel: ChannelKey, content: LaunchContent): string | null {
  if (channel === "email") {
    const email = content.email;
    if (!email || !email.to?.trim() || !email.subject?.trim() || !email.body?.trim()) {
      return "Email is missing a recipient, subject, or body.";
    }
  }
  if (channel === "whatsapp") {
    if (!content.whatsapp || !content.whatsapp.message?.trim()) {
      return "WhatsApp message is empty.";
    }
  }
  if (channel === "social") {
    if (!content.social || !content.social.caption?.trim()) {
      return "Social caption is empty.";
    }
  }
  return null;
}

export function evaluateReadiness(
  channels: ChannelKey[],
  content: LaunchContent,
  offsets: ChannelOffsets
): ReadinessFlag[] {
  const flags: ReadinessFlag[] = [];

  for (const channel of channels) {
    const missingReason = isChannelContentMissing(channel, content);
    if (missingReason) {
      flags.push({
        id: nextFlagId(),
        severity: "blocker",
        channel,
        message: `${CHANNEL_LABELS[channel]}: ${missingReason}`,
        acknowledged: false,
      });
    }
  }

  if (channels.includes("whatsapp") && content.whatsapp?.message?.trim()) {
    if (!OPT_OUT_PATTERN.test(content.whatsapp.message)) {
      flags.push({
        id: nextFlagId(),
        severity: "warning",
        channel: "whatsapp",
        message:
          "WhatsApp message doesn't include an opt-out instruction (e.g. \"Reply STOP to unsubscribe\"). Recommended for compliance.",
        acknowledged: false,
      });
    }
  }

  const activeOffsets = channels
    .map((channel) => ({ channel, offset: offsets[channel] ?? 0 }))
    .filter((entry) => entry.offset !== undefined);

  if (activeOffsets.length > 1) {
    const max = Math.max(...activeOffsets.map((e) => e.offset));
    const min = Math.min(...activeOffsets.map((e) => e.offset));
    if (max - min > TIMING_SKEW_THRESHOLD_MINUTES) {
      const earliest = activeOffsets.find((e) => e.offset === min)!;
      const latest = activeOffsets.find((e) => e.offset === max)!;
      flags.push({
        id: nextFlagId(),
        severity: "warning",
        message: `${CHANNEL_LABELS[latest.channel]} is scheduled ${
          max - min
        } minutes after ${CHANNEL_LABELS[earliest.channel]} — consider aligning timing for a coordinated launch.`,
        acknowledged: false,
      });
    }
  }

  return flags;
}
