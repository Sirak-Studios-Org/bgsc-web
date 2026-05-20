"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, Home, Users, BarChart2, User } from "lucide-react";

const NAV = [
  { href: "/portal",           label: "Home",      Icon: Home },
  { href: "/portal/learn",     label: "Learn",     Icon: BookOpen },
  { href: "/portal/community", label: "Community", Icon: Users },
  { href: "/portal/tracking",  label: "Tracking",  Icon: BarChart2 },
  { href: "/portal/profile",   label: "Profile",   Icon: User },
];

export default function PortalNav({ mode }: { mode: "sidebar" | "bottom" }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/portal/auth/logout", { method: "POST" });
    router.push("/portal/login");
  }

  const isActive = (href: string) =>
    href === "/portal" ? pathname === "/portal" : pathname.startsWith(href);

  if (mode === "sidebar") {
    return (
      <nav className="w-56 h-screen flex flex-col border-r sticky top-0"
        style={{ background: "var(--surface-1)", borderColor: "var(--border)" }}>
        <div className="p-5 border-b" style={{ borderColor: "var(--border)" }}>
          <Image src="/images/primary-logo.svg" alt="BGSC" width={100} height={32} className="h-8 w-auto" />
        </div>
        <div className="flex-1 py-4">
          {NAV.map(({ href, label, Icon }) => (
            <Link key={href} href={href}
              className="flex items-center gap-3 px-5 py-3 text-sm transition-colors"
              style={{
                color: isActive(href) ? "var(--crimson)" : "rgba(255,255,255,0.5)",
                borderLeft: isActive(href) ? "3px solid var(--crimson)" : "3px solid transparent",
                fontFamily: "var(--font-display)",
              }}>
              <Icon size={16} />
              <span className="uppercase tracking-wider text-xs">{label}</span>
            </Link>
          ))}
        </div>
        <div className="p-4 border-t" style={{ borderColor: "var(--border)" }}>
          <button onClick={logout} className="text-xs uppercase tracking-widest w-full text-left"
            style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-display)" }}>
            Sign Out
          </button>
        </div>
      </nav>
    );
  }

  // Bottom nav
  return (
    <nav className="flex items-center justify-around px-2 py-2 border-t"
      style={{ background: "var(--surface-1)", borderColor: "var(--border)" }}>
      {NAV.map(({ href, label, Icon }) => (
        <Link key={href} href={href}
          className="flex flex-col items-center gap-1 px-3 py-1 min-w-0"
          style={{ color: isActive(href) ? "var(--crimson)" : "rgba(255,255,255,0.4)" }}>
          <Icon size={20} />
          <span className="text-[10px] uppercase tracking-wider" style={{ fontFamily: "var(--font-display)" }}>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
