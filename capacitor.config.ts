import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "club.badgirlstrength.app",
  appName: "Bad Girl Strength Club",
  webDir: "out",
  server: {
    url: process.env.CAPACITOR_SERVER_URL ?? "http://localhost:3002",
    cleartext: true,
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0D0D0D",
      androidSplashResourceName: "splash",
      showSpinner: false,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    StatusBar: {
      style: "Dark",
      backgroundColor: "#0D0D0D",
    },
  },
  android: {
    buildOptions: {
      releaseType: "AAB",
    },
  },
  ios: {
    contentInset: "always",
  },
};

export default config;
