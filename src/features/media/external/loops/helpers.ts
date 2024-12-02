import { canBypassCors } from "#/helpers/device";

// https://loops.video/v/4sMCq0wx00
// allow dash and uppercase
export const loopsUrlRegex = /^https?:\/\/loops.video\/v\/([a-zA-Z0-9-_]+)/;

export function platformSupportsLoops() {
  return canBypassCors();
}

export function isLoops(url: string): boolean {
  if (!platformSupportsLoops()) return false;

  return loopsUrlRegex.test(url);
}
