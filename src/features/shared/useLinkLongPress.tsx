import { useIonActionSheet } from "@ionic/react";
import { compact, noop } from "es-toolkit";
import { copyOutline, earthOutline } from "ionicons/icons";
import { useLongPress } from "use-long-press";

import { shareUrl } from "#/features/share/share";
import { useOpenNativeBrowserIfPreferred } from "#/features/shared/useNativeBrowser";
import {
  getShareIcon,
  isAndroid,
  isNative,
  isTouchDevice,
} from "#/helpers/device";
import { stopIonicTapClick } from "#/helpers/ionic";
import { filterEvents } from "#/helpers/longPress";
import {
  copyClipboardFailed,
  copyClipboardSuccess,
} from "#/helpers/toastMessages";
import useAppToast from "#/helpers/useAppToast";

function useLinkLongPressAndroid(url: string | undefined) {
  const openNativeBrowser = useOpenNativeBrowserIfPreferred();
  const [presentActionSheet] = useIonActionSheet();
  const presentToast = useAppToast();

  function onLinkLongPress() {
    stopIonicTapClick();

    const _url = url;
    if (!_url) return;

    presentActionSheet({
      header: url,
      cssClass: "left-align-buttons",
      buttons: compact([
        {
          icon: copyOutline,
          text: "Copy link",
          handler: () => {
            (async () => {
              try {
                await navigator.clipboard.writeText(_url);
              } catch (error) {
                presentToast({
                  ...copyClipboardFailed,
                  fullscreen: false,
                  position: "top",
                });
                throw error;
              }

              presentToast({
                ...copyClipboardSuccess,
                fullscreen: false,
                position: "top",
              });
            })();
          },
        },
        {
          icon: earthOutline,
          text: "Open in browser",
          handler: () => {
            openNativeBrowser(url);
          },
        },
        ("share" in navigator || isNative()) && {
          icon: getShareIcon(),
          text: "Share link",
          handler: () => {
            shareUrl(_url);
          },
        },
        {
          text: "Cancel",
          role: "cancel",
        },
      ]),
    });
  }

  return useLongPress(onLinkLongPress, {
    filterEvents,
    cancelOnMovement: 15,
    onStart: (e) => {
      e.preventDefault();
      e.stopPropagation();
    },
  });
}

// stub when unsupported
const useLinkLongPressNoop = () => {
  return noop;
};

// android as PWA or in browser has long press for links
// however android capacitor webview doesn't. Also desktop doesn't.
export default (isAndroid() && isNative()) || !isTouchDevice()
  ? useLinkLongPressAndroid
  : useLinkLongPressNoop;
