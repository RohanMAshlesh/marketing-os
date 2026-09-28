import { notFound } from "next/navigation";
import { store } from "@/lib/store";
import { LaunchView } from "@/components/LaunchView";

export default function LaunchPage({ params }: { params: { id: string } }) {
  const launch = store.get(params.id);
  if (!launch) notFound();

  return <LaunchView initialLaunch={launch} />;
}
