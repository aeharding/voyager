import UAParser from "ua-parser-js";

export function isInstalled(): boolean {
  return window.matchMedia("(display-mode: standalone)").matches;
}

export const ua = new UAParser(navigator.userAgent);
