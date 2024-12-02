import { canBypassCors } from "#/helpers/device";

export const redgifUrlRegex =
  /^https?:\/\/(?:www\.|v3\.)?redgifs.com\/watch\/([a-z]+)/;

export function platformSupportsRedgif() {
  return canBypassCors();
}

export function isRedgif(url: string): boolean {
  if (!platformSupportsRedgif()) return false;

  return redgifUrlRegex.test(url);
}
