import { ChannelStatus, EmailContent, SocialContent, WhatsAppContent } from "./types";

function now(): string {
  return new Date().toISOString();
}

/**
 * Real connector: sends an actual email via Resend's free tier.
 * Falls back to a clearly-labeled simulation if no API key is configured,
 * so the app still runs end-to-end without any setup.
 */
export async function sendEmail(content: EmailContent): Promise<ChannelStatus> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    await delay(800 + Math.random() * 800);
    return {
      state: "live",
      updatedAt: now(),
      detail: "Simulated — set RESEND_API_KEY to send a real email.",
    };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const from = process.env.RESEND_FROM || "Marketing OS <onboarding@resend.dev>";

    const { error } = await resend.emails.send({
      from,
      to: content.to,
      subject: content.subject,
      text: content.body,
    });

    if (error) {
      return {
        state: "failed",
        updatedAt: now(),
        detail: `Resend error: ${error.message}`,
      };
    }

    return { state: "live", updatedAt: now(), detail: `Delivered via Resend to ${content.to}` };
  } catch (err) {
    return {
      state: "failed",
      updatedAt: now(),
      detail: `Send failed: ${err instanceof Error ? err.message : "unknown error"}`,
    };
  }
}

const SIMULATED_FAILURE_RATE = 0.05;

/** Simulated connector: no real WhatsApp Business API in the MVP. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function sendWhatsApp(content: WhatsAppContent): Promise<ChannelStatus> {
  await delay(1500 + Math.random() * 2500);
  if (Math.random() < SIMULATED_FAILURE_RATE) {
    return {
      state: "failed",
      updatedAt: now(),
      detail: "Simulated failure — message queue timed out (demo simulation).",
    };
  }
  return { state: "live", updatedAt: now(), detail: "Simulated send — WhatsApp sandbox not connected." };
}

/** Simulated connector: no real social platform OAuth in the MVP. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function sendSocial(content: SocialContent): Promise<ChannelStatus> {
  await delay(1000 + Math.random() * 2000);
  if (Math.random() < SIMULATED_FAILURE_RATE) {
    return {
      state: "failed",
      updatedAt: now(),
      detail: "Simulated failure — platform rate-limited this post (demo simulation).",
    };
  }
  return { state: "live", updatedAt: now(), detail: "Simulated post — social platform not connected." };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
