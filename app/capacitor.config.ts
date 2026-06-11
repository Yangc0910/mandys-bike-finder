import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.mandysbikefinder.app",
  appName: "Mandy's Bike Finder",
  webDir: "public",
  server: {
    url: process.env.CAPACITOR_SERVER_URL || "https://app.mandysbikefinder.com",
    cleartext: false,
  },
};

export default config;
