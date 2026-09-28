"use client";

import { useRole } from "@/lib/role";

export function RoleSwitcher() {
  const [role, setRole] = useRole();

  return (
    <label className="flex items-center gap-2 text-xs text-slate-500">
      Viewing as
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as "manager" | "approver")}
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700"
      >
        <option value="manager">Campaign Manager</option>
        <option value="approver">Approver</option>
      </select>
    </label>
  );
}
