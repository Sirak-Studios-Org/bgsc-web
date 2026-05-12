"use client";

import AdminNav from "@/components/AdminNav";

export default function CoursesPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--near-black)", color: "#fff" }}>
      <AdminNav />
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">
        <p className="text-xs uppercase tracking-[0.3em] mb-6" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-display)" }}>Courses</p>
        <div className="p-12 text-center" style={{ border: "1px dashed var(--border)" }}>
          <p className="text-2xl font-black uppercase mb-3" style={{ fontFamily: "var(--font-display)", color: "#fff" }}>
            Course Content Coming Soon
          </p>
          <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.45)" }}>
            Passion app integration in progress. Modules, lessons, and member progress tracking will live here.
          </p>
          <div className="inline-flex items-center gap-3 px-5 py-3" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
            <span className="w-2 h-2 rounded-full" style={{ background: "var(--crimson)" }} />
            <span className="text-xs uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-display)" }}>
              Ingesting Passion App
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
