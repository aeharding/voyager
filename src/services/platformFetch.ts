import { fetch as tauriFetch } from "@tauri-apps/plugin-http";

import { getPlatform } from "#/helpers/device";

import nativeFetch from "./nativeFetch";

/**
 * Fetch for direct requests to arbitrary instances.
 *
 * On Capacitor and Tauri, requests are made by the native layer, bypassing
 * CORS and preserving headers (like User-Agent) that browsers strip.
 */
const platformFetch = (() => {
  switch (getPlatform()) {
    case "capacitor":
      return nativeFetch;
    case "tauri":
      return tauriFetch;
    case "web":
      return fetch.bind(globalThis);
  }
})();

export default platformFetch;
