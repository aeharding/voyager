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

      // Important: Without this, the status bar color is grey in light mode
      // https://github.com/ionic-team/capacitor-plugins/issues/1160
      launchFadeOutDuration: 0,
    },
    CapacitorHttp: {
      // Global shim is reverted in nativeFetch.ts
      enabled: true,
    },
  },
};

export default config;
