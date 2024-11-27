import { Capacitor } from "@capacitor/core";
import { Mode } from "@ionic/core";
import { NavMode, NavModes } from "capacitor-android-nav-mode";
import { memoize } from "es-toolkit";
import { shareOutline, shareSocialOutline } from "ionicons/icons";
import { UAParser } from "ua-parser-js";

import { get, LOCALSTORAGE_KEYS } from "#/features/settings/syncStorage";

export function getDeviceMode(): Mode {
  // md mode is beta, so default ios for all devices
  return get(LOCALSTORAGE_KEYS.DEVICE_MODE) ?? "ios";
}

export const isNative = memoize(() => {
  return Capacitor.isNativePlatform();
});

export function isInstalled(): boolean {
  return isNative() || window.matchMedia("(display-mode: standalone)").matches;
}

export const ua = new UAParser(navigator.userAgent);

export const isInstallable =
  ua.getDevice().type === "mobile" || ua.getDevice().type === "tablet";

export function isAppleDeviceInstalledToHomescreen(): boolean {
  return ua.getDevice().vendor === "Apple" && isInstalled();
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
    top: parseValue(style.getPropertyValue("--sat")),
    right: parseValue(style.getPropertyValue("--sar")),
    bottom: parseValue(style.getPropertyValue("--sab")),
    left: parseValue(style.getPropertyValue("--sal")),
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

export const getShareIcon = memoize(() =>
  isIosTheme() ? shareOutline : shareSocialOutline,
);
