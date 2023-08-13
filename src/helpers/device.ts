import UAParser from "ua-parser-js";
import { Capacitor } from "@capacitor/core";
import { NavMode, NavModes } from "capacitor-android-nav-mode";

export function isNative() {
  return Capacitor.isNativePlatform();
}

export function isInstalled(): boolean {
  return window.matchMedia("(display-mode: standalone)").matches || isNative();
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
