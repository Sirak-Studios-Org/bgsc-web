import { ReactNode } from "react";
import PortalNav from "@/components/portal/PortalNav";
import CapacitorInit from "@/components/portal/CapacitorInit";

export const metadata = { title: "BGSC Members Portal" };

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "var(--near-black)", color: "var(--soft-white)" }}>
      <CapacitorInit />
      <div className="flex">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <PortalNav mode="sidebar" />
        </div>
        {/* Main content */}
        <main className="flex-1 min-h-screen pb-20 lg:pb-0 lg:pl-0">
          {children}
        </main>
      </div>
      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <PortalNav mode="bottom" />
      </div>
    </div>
  );
}
