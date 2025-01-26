import { App } from "@capacitor/app";
import Dexie from "dexie";

import { isAppleDeviceInstallable, isNative } from "#/helpers/device";

/**
 * https://github.com/ionic-team/cordova-plugin-ionic-webview/issues/354#issuecomment-1305878417
 */
if (isNative() && isAppleDeviceInstallable()) {
  App.addListener("appStateChange", async (state) => {
    const dbLastClosed = +(localStorage.getItem("db-closed") || 0);
    const thirtySecondsAgo = Date.now() - 30_000;

    const reloadedRecently = dbLastClosed > thirtySecondsAgo;

    if (!state.isActive) return;
    if (reloadedRecently) return;

    console.info("Checking database integrity...");

    // Fix connection Storage sometime lost (iOS)
    try {
      await Dexie.exists("WefwefDB");
    } catch (error) {
      console.info("Failed database integrity check!", error);

      localStorage.setItem("db-closed", Date.now().toString());

      window.location.reload();

      throw error;
    }

    console.info("Passed database integrity check!");
  });
}
