import { Capacitor } from "@capacitor/core";
import { isPlatform } from "@ionic/core";
import { NavMode, NavModes } from "capacitor-android-nav-mode";
import { memoize } from "es-toolkit";
import {
  share,
  shareOutline,
  shareSocial,
  shareSocialOutline,
} from "ionicons/icons";
import { UAParser } from "ua-parser-js";

import { getDeviceMode } from "#/features/settings/syncStorage";

export const isNative = memoize(() => {
  return Capacitor.isNativePlatform();
});

/**
 * Run `VITE_FORCE_NO_CORS=true` in dev to test with following command to disable CORS for easier testing
 *
 * ```
 * /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --disable-site-isolation-trials --disable-web-security --user-data-dir="~/tmp"
 * ```
 */
export function canBypassCors() {
  if (import.meta.env.VITE_FORCE_NO_CORS) return true;
  return isNative();
}

export function isInstalled(): boolean {
  return isNative() || window.matchMedia("(display-mode: standalone)").matches;
}

export const ua = new UAParser(navigator.userAgent);

export const isInstallable =
  ua.getDevice().type === "mobile" || ua.getDevice().type === "tablet";

export function isAppleDeviceInstalledToHomescreen(): boolean {
  return (
    ua.getDevice().vendor === "Apple" && isInstalled() && !isPlatform("desktop")
  );
}

export function isAppleDeviceInstallable(): boolean {
  return ua.getDevice().vendor === "Apple" && isTouchDevice();
}

export function isTouchDevice() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

export function getSafeArea() {
  const style = getComputedStyle(document.documentElement);

  function parseValue(val: string): number {
    return +val.slice(0, -2);
  }

  return {
    top: parseValue(style.getPropertyValue("--ion-safe-area-top")),
    right: parseValue(style.getPropertyValue("--ion-safe-area-right")),
    bottom: parseValue(style.getPropertyValue("--ion-safe-area-bottom")),
    left: parseValue(style.getPropertyValue("--ion-safe-area-left")),
  };
}

export function isAndroid() {
  return /android/i.test(navigator.userAgent);
}

export function supportsWebp() {
  const { name, version } = ua.getOS();

  return name !== "iOS" || (version && +version >= 14);
}

export let androidNavMode: Promise<NavModes> | undefined;

export function getAndroidNavMode() {
  if (androidNavMode !== undefined) return androidNavMode;
  if (!isAndroid() || !isNative()) return;

  const promise = NavMode.getNavigationMode().then(({ mode }) => mode);
  androidNavMode = promise;
  return promise;
}

export const isIosTheme = memoize(() => getDeviceMode() === "ios");

export const getShareIcon = memoize((filled = false) => {
  if (filled) return isIosTheme() ? share : shareSocial;

  return isIosTheme() ? shareOutline : shareSocialOutline;
});
