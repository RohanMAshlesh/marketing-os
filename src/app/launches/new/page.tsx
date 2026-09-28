import { LaunchForm } from "@/components/LaunchForm";
import { Card } from "@/components/ui/Card";

export default function NewLaunchPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-xl font-semibold tracking-tight">New Launch</h1>
      <p className="mb-6 text-sm text-slate-500">
        Add approved content per channel. We&apos;ll check it for issues before you launch.
      </p>
      <Card>
        <LaunchForm />
      </Card>
    </div>
  );
}
