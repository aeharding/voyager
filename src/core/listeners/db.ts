import { App } from "@capacitor/app";
import Dexie from "dexie";

import { isAppleDeviceInstallable, isNative } from "#/helpers/device";

const DB_CLOSED_STORAGE_KEY = "db-closed";

/**
 * https://github.com/ionic-team/cordova-plugin-ionic-webview/issues/354#issuecomment-1305878417
 */
if (isNative() && isAppleDeviceInstallable()) {
  App.addListener("appStateChange", async (state) => {
    const dbLastClosed = +(localStorage.getItem(DB_CLOSED_STORAGE_KEY) || 0);
    const thirtySecondsAgo = Date.now() - 30_000;

    const reloadedRecently = dbLastClosed > thirtySecondsAgo;

    if (!state.isActive) return;
    if (reloadedRecently) return;

    console.info("Checking database integrity...");

    // Fix connection Storage sometime lost (iOS)
    try {
      await Dexie.exists("WefwefDB");
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      if (error.name !== "UnknownError") throw error;
      if (
        !error.message.includes(
          "Connection to Indexed Database server lost. Refresh the page to try again",
        )
      )
        throw error;

      console.info("Failed database integrity check!", error);

      localStorage.setItem(DB_CLOSED_STORAGE_KEY, Date.now().toString());

      window.location.reload();

      throw error;
    }

    console.info("Passed database integrity check!");
  });
}
