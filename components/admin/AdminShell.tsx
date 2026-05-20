"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, BookOpen, MessageSquare,
  FileEdit, Settings, Menu, X, LogOut, Upload,
} from "lucide-react";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/members", label: "Members", icon: Users },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/community", label: "Community", icon: MessageSquare },
  { href: "/admin/content", label: "Content", icon: FileEdit },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function logout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin");
  }

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex flex-col h-full ${mobile ? "w-full" : "w-56"}`}
      style={{ background: "var(--surface-1)", borderRight: "1px solid var(--border)" }}>
      <div className="px-5 py-5 border-b" style={{ borderColor: "var(--border)" }}>
        <Image src="/images/primary-logo.svg" alt="BGSC Admin" width={90} height={30} className="h-7 w-auto" />
      </div>

      <nav className="flex-1 py-4 space-y-0.5 px-2">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={href} href={href} onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-xs uppercase tracking-widest transition-colors rounded-sm"
              style={{
                fontFamily: "var(--font-display)",
                color: active ? "#fff" : "rgba(255,255,255,0.4)",
                background: active ? "rgba(143,0,0,0.2)" : "transparent",
                borderLeft: active ? "2px solid var(--crimson)" : "2px solid transparent",
              }}>
              <Icon size={14} style={{ color: active ? "var(--crimson)" : "rgba(255,255,255,0.3)" }} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-2 pb-4 border-t pt-4" style={{ borderColor: "var(--border)" }}>
        <Link href="/admin/members/import" onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 text-xs uppercase tracking-widest transition-colors rounded-sm mb-1"
          style={{
            fontFamily: "var(--font-display)",
            color: pathname.startsWith("/admin/members/import") ? "#fff" : "rgba(255,255,255,0.35)",
            background: pathname.startsWith("/admin/members/import") ? "rgba(143,0,0,0.15)" : "transparent",
          }}>
          <Upload size={13} style={{ color: "rgba(255,255,255,0.3)" }} />
          Import Members
        </Link>
        <button onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 text-xs uppercase tracking-widest w-full transition-colors rounded-sm"
          style={{ fontFamily: "var(--font-display)", color: "rgba(255,255,255,0.3)" }}>
          <LogOut size={13} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ background: "var(--near-black)", color: "#fff" }}>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col flex-shrink-0 h-screen sticky top-0">
        <Sidebar />
      </aside>

      {/* Mobile header + drawer */}
      <div className="flex flex-col flex-1 min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}>
          <Image src="/images/primary-logo.svg" alt="BGSC" width={70} height={24} className="h-6 w-auto" />
          <button onClick={() => setMobileOpen(o => !o)} style={{ color: "rgba(255,255,255,0.7)" }}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex" style={{ background: "rgba(0,0,0,0.7)" }}
            onClick={() => setMobileOpen(false)}>
            <div className="w-64 h-full" onClick={e => e.stopPropagation()}>
              <Sidebar mobile />
            </div>
          </div>
        )}

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
