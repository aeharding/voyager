import { Share } from "@capacitor/share";
import { ShareSafari } from "capacitor-share-safari";

import { isAndroid } from "./device";
import { isNative } from "./device";

export function shareUrl(url: string) {
  // // For iOS, use custom plugin to add "Open in Safari"
  // // https://stackoverflow.com/a/73964790/1319878
  if (isNative() && !isAndroid()) {
    ShareSafari.share({ url });
    return;
  }

  return Share.share({ url });
}
