"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

declare global {
  interface Window { posthog?: { capture: (event: string, props?: Record<string, unknown>) => void; init: (key: string, opts: Record<string, unknown>) => void }; }
}

export function track(type: string, meta?: Record<string, unknown>) {
  fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, path: window.location.pathname, referrer: document.referrer, meta }),
  }).catch(() => {});

  if (typeof window !== "undefined" && window.posthog) {
    window.posthog.capture(type, meta);
  }
}

export default function Analytics({ posthogKey }: { posthogKey?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (posthogKey && typeof window !== "undefined" && !window.posthog) {
      import("posthog-js").then(({ default: posthog }) => {
        posthog.init(posthogKey, { api_host: "https://app.posthog.com", capture_pageview: false });
        window.posthog = posthog as unknown as typeof window.posthog;
      });
    }
  }, [posthogKey]);

  useEffect(() => {
    track("pageview");
    if (window.posthog) window.posthog.capture("$pageview");
  }, [pathname, searchParams]);

  return null;
}
