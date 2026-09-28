export type ChannelKey = "email" | "whatsapp" | "social";

export type ChannelState = "idle" | "scheduled" | "pending" | "live" | "failed";

export type LaunchStage = "review" | "launching" | "done";

export interface EmailContent {
  to: string;
  subject: string;
  body: string;
}

export interface WhatsAppContent {
  message: string;
}

export interface SocialContent {
  caption: string;
}

export interface LaunchContent {
  email?: EmailContent;
  whatsapp?: WhatsAppContent;
  social?: SocialContent;
}

export interface ChannelOffsets {
  email?: number;
  whatsapp?: number;
  social?: number;
}

export interface ChannelStatus {
  state: ChannelState;
  updatedAt: string;
  detail?: string;
}

export type FlagSeverity = "blocker" | "warning";

export interface ReadinessFlag {
  id: string;
  severity: FlagSeverity;
  channel?: ChannelKey;
  message: string;
  acknowledged: boolean;
}

export interface Launch {
  id: string;
  name: string;
  channels: ChannelKey[];
  content: LaunchContent;
  offsets: ChannelOffsets;
  scheduledFor: string | null;
  createdAt: string;
  stage: LaunchStage;
  flags: ReadinessFlag[];
  channelStatus: Record<ChannelKey, ChannelStatus>;
}

export const CHANNEL_LABELS: Record<ChannelKey, string> = {
  email: "Email",
  whatsapp: "WhatsApp",
  social: "Social",
};
