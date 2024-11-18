import { isNative } from "#/helpers/device";

export const redgifUrlRegex =
  /^https?:\/\/(?:www\.|v3\.)?redgifs.com\/watch\/([a-z]+)/;

/**
 * Uncomment `return true` in dev to test with following command to disable CORS for testing
 *
 * ```
 * /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --disable-site-isolation-trials --disable-web-security --user-data-dir="~/tmp"
 * ```
 */
export function platformSupportsRedgif() {
  // return true;
  return isNative();
}

export function isRedgif(url: string): boolean {
  if (!platformSupportsRedgif()) return false;

  return redgifUrlRegex.test(url);
}
