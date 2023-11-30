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
      resizeOnFullScreen: true,
      resize: KeyboardResize.None,
    },
  },
};

export default config;
