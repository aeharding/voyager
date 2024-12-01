import { CapacitorConfig } from "@capacitor/cli";
import { KeyboardResize } from "@capacitor/keyboard";

const config: CapacitorConfig = {
  appId: "app.vger.voyager",
  appName: "Voyager",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
  plugins: {
    Keyboard: {
      resize: KeyboardResize.Ionic,
      resizeOnFullScreen: true,
    },
    SplashScreen: {
      launchShowDuration: 3_000,
    },
    CapacitorHttp: {
      // Global shim is reverted in nativeFetch.ts
      enabled: true,
    },
  },
};

export default config;
