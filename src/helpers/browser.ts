import { openUrl } from "@tauri-apps/plugin-opener";

import { getPlatform } from "./device";

/**
 * Open in the user's default browser
 *
 * (The Tauri webview can't open windows, so `window.open`
 * is a no-op there — tauri-apps/tauri#1657)
 */
export function openInBrowser(href: string) {
  if (getPlatform() === "tauri") {
    openUrl(href);
    return;
  }

  window.open(href, "_blank");
}
