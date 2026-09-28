import {
  BarChartIcon,
  CHANNEL_ICONS,
  CheckCircleIcon,
  EditIcon,
  RocketIcon,
  SearchIcon,
  SparklesIcon,
} from "@/components/ui/Icons";

interface Node {
  Icon: typeof EditIcon;
  label: string;
  sub: string;
  left: number; // percent position along the track
}

const NODES: Node[] = [
  { Icon: EditIcon, label: "Brief", sub: "one line", left: 0 },
  { Icon: SparklesIcon, label: "AI draft", sub: "per channel", left: 20 },
  { Icon: CheckCircleIcon, label: "Approve", sub: "channel by channel", left: 40 },
  { Icon: SearchIcon, label: "Readiness check", sub: "catches the dumb stuff", left: 60 },
  { Icon: RocketIcon, label: "Launch", sub: "one click", left: 80 },
  { Icon: BarChartIcon, label: "Status", sub: "one screen", left: 100 },
];

const CHANNELS: { key: "email" | "whatsapp" | "social"; label: string; delay: number }[] = [
  { key: "email", label: "Email", delay: 5.85 },
  { key: "whatsapp", label: "WhatsApp", delay: 6.05 },
  { key: "social", label: "Social", delay: 6.25 },
];

const DURATION = 7; // seconds, must match tailwind.config.ts flow-dot / node-pulse

function delayFor(leftPercent: number): string {
  const arrival = (leftPercent / 100) * DURATION;
  return `${-arrival}s`;
}

export function WorkflowDiagram() {
  return (
    <div className="card mesh-bg p-8">
      <div className="relative h-24">
        {/* track */}
        <div className="absolute left-0 right-0 top-8 h-0.5 rounded-full bg-slate-200" />

        {/* moving dot */}
        <div
          className="absolute top-8 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500 shadow-[0_0_10px_2px_rgba(79,70,229,0.55)] animate-flow-dot"
          aria-hidden
        />

        {/* nodes */}
        {NODES.map((node) => (
          <div
            key={node.label}
            className="absolute top-8 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            style={{ left: `${node.left}%` }}
          >
            <div
              className="flex h-11 w-11 items-center justify-center rounded-full border border-indigo-200 bg-indigo-50 text-indigo-600 animate-node-pulse"
              style={{ animationDelay: delayFor(node.left) }}
            >
              <node.Icon className="h-5 w-5" />
            </div>
            <p className="mt-2 whitespace-nowrap text-xs font-medium text-slate-700">{node.label}</p>
            <p className="whitespace-nowrap text-[10px] text-slate-400">{node.sub}</p>
          </div>
        ))}
      </div>

      {/* fan-out to channels under Launch/Status */}
      <div className="mt-10 flex justify-end gap-6 pr-2">
        {CHANNELS.map((c) => {
          const Icon = CHANNEL_ICONS[c.key];
          return (
            <div key={c.label} className="flex flex-col items-center">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 animate-node-pulse"
                style={{ animationDelay: `${-c.delay}s` }}
              >
                <Icon className="h-4 w-4" />
              </div>
              <p className="mt-1 text-[10px] text-slate-400">{c.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
