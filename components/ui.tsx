"use client";

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-xs font-bold tracking-[0.35em] uppercase mb-4", className)}
       style={{ color: "var(--crimson)", fontFamily: "var(--font-display, 'Poppins', sans-serif)" }}>
      {children}
    </p>
  );
}

export function Display({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn("font-black uppercase leading-none tracking-tight", className)}
        style={{ fontFamily: "var(--font-display, 'Poppins', sans-serif)", color: "#F5F5F3" }}>
      {children}
    </h2>
  );
}
