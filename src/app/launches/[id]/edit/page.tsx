import { notFound } from "next/navigation";
import { store } from "@/lib/store";
import { LaunchForm } from "@/components/LaunchForm";
import { Card } from "@/components/ui/Card";

export default function EditLaunchPage({ params }: { params: { id: string } }) {
  const launch = store.get(params.id);
  if (!launch) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-xl font-semibold tracking-tight">Edit Launch</h1>
      <p className="mb-6 text-sm text-slate-500">
        Changes will be re-checked for readiness issues before you can launch.
      </p>
      <Card>
        <LaunchForm launch={launch} />
      </Card>
    </div>
  );
}
