import { ThreadiverseClient } from "threadiverse";

import { isNative } from "#/helpers/device";

import nativeFetch from "./nativeFetch";

const usingNativeFetch = isNative();

const BASE_HEADERS = {
  ["User-Agent"]: "VoyagerApp/1.0",
} as const;

export function buildBaseClientUrl(url: string): string {
  if (import.meta.env.VITE_FORCE_LEMMY_INSECURE) {
    return `http://${url}`;
  }

  return `https://${url}`;
}

export function getClient(url: string, jwt?: string) {
  return new ThreadiverseClient(buildBaseClientUrl(url), {
    fetchFunction: usingNativeFetch ? nativeFetch : fetch.bind(globalThis),
    headers: jwt
      ? {
          ...BASE_HEADERS,
          Authorization: `Bearer ${jwt}`,
          ["Cache-Control"]: "no-cache", // otherwise may get back cached site response (despite JWT)
        }
      : BASE_HEADERS,
  });
}
