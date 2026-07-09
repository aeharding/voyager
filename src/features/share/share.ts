import { Share } from "@capacitor/share";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { ShareSafari } from "capacitor-share-safari";

import { getPlatform, isAndroid } from "#/helpers/device";
import useAppToast from "#/helpers/useAppToast";

export function shareUrl(url: string) {
  // // For iOS, use custom plugin to add "Open in Safari"
  // // https://stackoverflow.com/a/73964790/1319878
  if (getPlatform() === "capacitor" && !isAndroid()) {
    ShareSafari.share({ url });
    return;
  }

  return Share.share({ url });
}

export function canShare() {
  // tauri "shares" by copying to clipboard
  return getPlatform() !== "web" || "share" in navigator;
}

export function useShare() {
  const presentToast = useAppToast();

  return onShare;

  async function onShare(url: string) {
    // No system share sheet on Linux. Copy via IPC — unlike
    // navigator.clipboard, no user activation required
    if (getPlatform() === "tauri") {
      await writeText(url);

      presentToast({
        message: "Copied link!",
      });

      return;
    }

    try {
      await shareUrl(url);
    } catch (error) {
      if (getPlatform() === "capacitor") throw error;

      if (error instanceof DOMException) {
        switch (error.name) {
          case "NotAllowedError":
            presentToast({
              message: `Tap to share`,
              onClick: () => onShare(url),
            });
            return;
          case "AbortError":
            return;
        }
      }

      await copyToClipboard(url);

      return;
    }
  }

  async function copyToClipboard(url: string) {
    try {
      await navigator.clipboard.writeText(url);
    } catch (error) {
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        presentToast({
          message: `Tap to copy`,
          onClick: () => onShare(url),
        });
        return;
      }

      throw error;
    }

    presentToast({
      message: "Copied link!",
    });
  }
}
