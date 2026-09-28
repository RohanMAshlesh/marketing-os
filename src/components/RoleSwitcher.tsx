"use client";

import { useRole } from "@/lib/role";
import { ChevronDownIcon, UserShieldIcon } from "@/components/ui/Icons";

const OPTIONS: { value: "manager" | "approver"; label: string }[] = [
  { value: "manager", label: "Manager view" },
  { value: "approver", label: "Approver view" },
];

export function RoleSwitcher() {
  const [role, setRole] = useRole();

  return (
    <div className="relative hidden sm:block">
      <UserShieldIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as "manager" | "approver")}
        className="appearance-none rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-7 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
    </div>
  );
}
