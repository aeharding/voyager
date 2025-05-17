import { Share } from "@capacitor/share";
import { ShareSafari } from "capacitor-share-safari";

import { isAndroid } from "./device";
import { isNative } from "./device";
import useAppToast from "./useAppToast";

export function shareUrl(url: string) {
  // // For iOS, use custom plugin to add "Open in Safari"
  // // https://stackoverflow.com/a/73964790/1319878
  if (isNative() && !isAndroid()) {
    ShareSafari.share({ url });
    return;
  }

  return Share.share({ url });
}

export function canShare() {
  return isNative() || "share" in navigator;
}

export function useShare() {
  const presentToast = useAppToast();

  return onShare;

  async function onShare(url: string) {
    try {
      await shareUrl(url);
    } catch (error) {
      if (isNative()) throw error;

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
