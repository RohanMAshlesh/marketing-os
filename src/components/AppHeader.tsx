"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { RoleSwitcher } from "@/components/RoleSwitcher";

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/login") return null;

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
              MO
            </span>
            <div>
              <p className="text-sm font-semibold leading-tight">Marketing OS</p>
              <p className="text-xs leading-tight text-slate-500">Launch Hub</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-4 text-sm text-slate-600 sm:flex">
            <Link href="/" className="hover:text-slate-900">
              Dashboard
            </Link>
            <Link href="/know-the-demo" className="hover:text-slate-900">
              Know the demo
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <RoleSwitcher />
          <Link
            href="/launches/new"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            New Launch
          </Link>
          <button onClick={logout} className="text-xs text-slate-400 hover:text-slate-600">
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
