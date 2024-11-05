import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.vger.voyager",
  appName: "Voyager",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
  plugins: {
    Keyboard: {
      resizeOnFullScreen: true,
    },
  },
};

export default config;
