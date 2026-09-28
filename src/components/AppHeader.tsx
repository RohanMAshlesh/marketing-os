"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { Button } from "@/components/ui/Button";

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/login") return null;

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const navLink = (href: string, label: string) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={`rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ${
          active ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3.5">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-sm">
              MO
            </span>
            <div>
              <p className="text-sm font-semibold leading-tight tracking-tight">Marketing OS</p>
              <p className="text-[11px] leading-tight text-slate-400">Launch Hub</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            {navLink("/", "Dashboard")}
            {navLink("/know-the-demo", "Know the demo")}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <RoleSwitcher />
          <Link href="/launches/new">
            <Button size="sm">New Launch</Button>
          </Link>
          <button
            onClick={logout}
            className="text-xs text-slate-400 transition-colors hover:text-slate-600"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
