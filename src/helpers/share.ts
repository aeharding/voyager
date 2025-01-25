import { Share } from "@capacitor/share";

export function shareUrl(url: string) {
  // TODO: Implement this for iOS after capacitor upgrade
  // // For iOS, use custom plugin to add "Open in Safari"
  // // https://stackoverflow.com/a/73964790/1319878
  // if (isNative() && !isAndroid()) {
  //   ShareSafari.share({ url });
  //   return;
  // }

  return Share.share({ url });
}
