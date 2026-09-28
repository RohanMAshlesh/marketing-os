import { notFound } from "next/navigation";
import { store } from "@/lib/store";
import { LaunchForm } from "@/components/LaunchForm";

export default function EditLaunchPage({ params }: { params: { id: string } }) {
  const launch = store.get(params.id);
  if (!launch) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-xl font-semibold">Edit Launch</h1>
      <p className="mb-6 text-sm text-slate-500">
        Changes will be re-checked for readiness issues before you can launch.
      </p>
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <LaunchForm launch={launch} />
      </div>
    </div>
  );
}
