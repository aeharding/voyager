import UAParser from "ua-parser-js";

export function isInstalled(): boolean {
  return window.matchMedia("(display-mode: standalone)").matches;
}

export const ua = new UAParser(navigator.userAgent);

export const isInstallable =
  ua.getDevice().type === "mobile" || ua.getDevice().type === "tablet";

export function isAppleDeviceInstalledToHomescreen(): boolean {
  return ua.getDevice().vendor === "Apple" && isInstalled();
}
