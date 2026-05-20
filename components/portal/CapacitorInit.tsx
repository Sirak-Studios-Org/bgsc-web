"use client";
import { useEffect } from "react";

export default function CapacitorInit() {
  useEffect(() => {
    async function init() {
      const { isNative, initPushNotifications, hideStatusBar } = await import("@/lib/capacitor");
      if (!isNative()) return;

      await hideStatusBar();

      await initPushNotifications(
        async (token) => {
          await fetch("/api/portal/push-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, platform: /android/i.test(navigator.userAgent) ? "android" : "ios" }),
          });
        },
        (data) => {
          console.log("[push]", data);
        }
      );
    }
    init();
  }, []);

  return null;
}
