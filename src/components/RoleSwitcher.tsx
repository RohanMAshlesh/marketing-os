"use client";

import { useRole } from "@/lib/role";

const OPTIONS: { value: "manager" | "approver"; label: string }[] = [
  { value: "manager", label: "Manager" },
  { value: "approver", label: "Approver" },
];

export function RoleSwitcher() {
  const [role, setRole] = useRole();

  return (
    <div className="hidden items-center gap-1.5 md:flex">
      <span className="text-xs text-slate-400">Viewing as</span>
      <div className="flex rounded-md border border-slate-200 bg-slate-100 p-0.5">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setRole(opt.value)}
            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              role === opt.value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
