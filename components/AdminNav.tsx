"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/courses", label: "Courses" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin");
  }

  return (
    <>
      <header className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "var(--border)", background: "var(--near-black)" }}>
        <Image src="/logo.svg" alt="BGSC" width={80} height={27} className="w-16 h-auto" />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-5">
          {NAV.map(({ href, label }) => (
            <Link key={href} href={href}
              className="text-xs uppercase tracking-widest transition-colors"
              style={{ fontFamily: "var(--font-display)", color: pathname.startsWith(href) ? "var(--crimson)" : "rgba(255,255,255,0.45)" }}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <button onClick={logout} className="text-xs uppercase tracking-widest transition-colors hover:text-white"
            style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-display)" }}>
            Sign Out
          </button>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(o => !o)} className="md:hidden p-1" style={{ color: "rgba(255,255,255,0.7)" }}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-b" style={{ background: "var(--surface-1)", borderColor: "var(--border)" }}>
          {NAV.map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className="flex items-center px-5 py-4 text-sm uppercase tracking-widest border-b"
              style={{
                fontFamily: "var(--font-display)",
                color: pathname.startsWith(href) ? "var(--crimson)" : "rgba(255,255,255,0.6)",
                borderColor: "var(--border)",
                borderLeft: pathname.startsWith(href) ? "3px solid var(--crimson)" : "3px solid transparent",
              }}>
              {label}
            </Link>
          ))}
          <button onClick={logout}
            className="w-full text-left px-5 py-4 text-sm uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-display)" }}>
            Sign Out
          </button>
        </div>
      )}
    </>
  );
}
