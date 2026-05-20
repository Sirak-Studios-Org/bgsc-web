export async function initPushNotifications(
  onToken: (token: string) => void,
  onNotification: (data: Record<string, unknown>) => void
): Promise<void> {
  if (typeof window === "undefined") return;
  const { Capacitor } = await import("@capacitor/core");
  if (!Capacitor.isNativePlatform()) return;

  const { PushNotifications } = await import("@capacitor/push-notifications");
  const { App } = await import("@capacitor/app");

  await PushNotifications.requestPermissions();
  await PushNotifications.register();

  PushNotifications.addListener("registration", (token) => {
    onToken(token.value);
  });
  PushNotifications.addListener("pushNotificationReceived", (notification) => {
    onNotification(notification.data as Record<string, unknown>);
  });
  PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
    const url = (action.notification.data as Record<string, unknown>)?.url as string;
    if (url) window.location.href = url;
  });

  App.addListener("appStateChange", ({ isActive }) => {
    if (isActive) PushNotifications.removeAllDeliveredNotifications();
  });
}

export async function triggerHaptic(style: "light" | "medium" | "heavy" = "medium"): Promise<void> {
  if (typeof window === "undefined") return;
  const { Capacitor } = await import("@capacitor/core");
  if (!Capacitor.isNativePlatform()) return;
  const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
  const map = { light: ImpactStyle.Light, medium: ImpactStyle.Medium, heavy: ImpactStyle.Heavy };
  await Haptics.impact({ style: map[style] });
}

export async function takePicture(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const { Capacitor } = await import("@capacitor/core");
  if (!Capacitor.isNativePlatform()) return null;
  const { Camera, CameraResultType, CameraSource } = await import("@capacitor/camera");
  const photo = await Camera.getPhoto({
    quality: 85,
    allowEditing: false,
    resultType: CameraResultType.DataUrl,
    source: CameraSource.Camera,
  });
  return photo.dataUrl ?? null;
}

export async function hideStatusBar(): Promise<void> {
  if (typeof window === "undefined") return;
  const { Capacitor } = await import("@capacitor/core");
  if (!Capacitor.isNativePlatform()) return;
  const { StatusBar } = await import("@capacitor/status-bar");
  await StatusBar.setOverlaysWebView({ overlay: true });
}

export function isNative(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return !!(window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.();
  } catch {
    return false;
  }
}
