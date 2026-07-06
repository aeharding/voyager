import { ThreadiverseClient } from "threadiverse";

import { isAndroid, isNative } from "#/helpers/device";

import platformFetch from "./platformFetch";

const USER_AGENT = "VoyagerApp/1.0";

export function buildBaseHeaders({
  android,
  native,
}: {
  android: boolean;
  native: boolean;
}) {
  return {
    ["User-Agent"]: USER_AGENT,

    // Android WebView strips User-Agent once headers enter a Request object
    // (https://issues.chromium.org/issues/40450316), replacing it with the
    // browser UA — which trips Cloudflare bot protection on some instances.
    // Capacitor's native layer converts x-cap-user-agent (which survives)
    // back to User-Agent on both its GET interceptor and plugin bridge paths.
    ...(native && android && { ["x-cap-user-agent"]: USER_AGENT }),
  };
}

const BASE_HEADERS = buildBaseHeaders({
  android: isAndroid(),
  native: isNative(),
});

export function buildBaseClientUrl(url: string): string {
  if (import.meta.env.VITE_FORCE_LEMMY_INSECURE) {
    return `http://${url}`;
  }

  return `https://${url}`;
}

export function getClient(url: string, jwt?: string) {
  return new ThreadiverseClient(buildBaseClientUrl(url), {
    fetchFunction: platformFetch,
    headers: jwt
      ? {
          ...BASE_HEADERS,
          Authorization: `Bearer ${jwt}`,
          ["Cache-Control"]: "no-cache", // otherwise may get back cached site response (despite JWT)
        }
      : BASE_HEADERS,
  });
}
