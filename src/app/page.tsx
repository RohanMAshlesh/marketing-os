import { store } from "@/lib/store";
import { DashboardView } from "@/components/DashboardView";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const launches = store.list();
  return <DashboardView launches={launches} />;
}
