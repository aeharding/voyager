import { fetch as tauriFetch } from "@tauri-apps/plugin-http";

import { isNative, isTauri } from "#/helpers/device";

import nativeFetch from "./nativeFetch";

/**
 * Fetch for direct requests to arbitrary instances.
 *
 * On Capacitor and Tauri, requests are made by the native layer, bypassing
 * CORS and preserving headers (like User-Agent) that browsers strip.
 */
const platformFetch = (() => {
  if (isNative()) return nativeFetch;
  if (isTauri()) return tauriFetch;
  return fetch.bind(globalThis);
})();

export default platformFetch;
