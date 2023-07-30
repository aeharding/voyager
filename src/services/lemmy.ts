import { LemmyHttp } from "lemmy-js-client";
import { reduceFileSize } from "../helpers/imageCompress";
import { isNative } from "../helpers/device";
import { omitUndefinedValues } from "../helpers/object";

function buildBaseUrl(url: string): string {
  return buildDirectConnectBaseUrl(url);
}

function buildDirectConnectBaseUrl(url: string): string {
  return `https://${url}`;
}

function buildProxiedBaseUrl(url: string): string {
  if (isNative()) return buildDirectConnectBaseUrl(url);

  return `${location.origin}/api/${url}`;
}

export function getClient(url: string): LemmyHttp {
  return new LemmyHttp(buildBaseUrl(url), {
    // Capacitor http plugin is not compatible with cross-fetch.
    // Bind to globalThis or lemmy-js-client will bind incorrectly
    fetchFunction: fetch.bind(globalThis),
  });
}

export const LIMIT = 30;

const PICTRS_URL = "/pictrs/image";

/**
 * This function is used instead of the one on lemmy-js-client
 * in order to get around an issue where the endpoint will
 * only accept requests with the jwt on the cookie
 *
 * @returns relative pictrs URL
 */
export async function uploadImage(url: string, auth: string, image: File) {
  const compressedImageIfNeeded = await reduceFileSize(
    image,
    990_000, // 990 kB - Lemmy's default limit is 1MB
    1500,
    1500,
    0.85
  );

  // Cookie header can only be set by native code (Capacitor http plugin)
  if (isNative()) {
    const response = await getClient(url).uploadImage({
      image: compressedImageIfNeeded as File,
      auth,
    });

    if (!response.url) throw new Error("unknown native image upload error");

    return response.url;
  }

  const formData = new FormData();

  formData.append("images[]", compressedImageIfNeeded);

  // All requests for image upload must be proxied due to Lemmy not accepting
  // parameterized JWT for this request (see: https://github.com/LemmyNet/lemmy/issues/3567)
  const response = await fetch(
    `${buildProxiedBaseUrl(url)}${PICTRS_URL}?${new URLSearchParams({ auth })}`,
    {
      method: "POST",
      body: formData,
    }
  );

  const json = await response.json();

  if (json.msg === "ok") {
    return `https://${url}${PICTRS_URL}/${json.files?.[0]?.file}`;
  }

  throw new Error("unknown image upload error");
}

interface ImageOptions {
  /**
   * maximum image dimension
   */
  size?: number;
}

export function getImageSrc(url: string, options?: ImageOptions) {
  if (!options || !options.size) return url;

  const urlParams = options
    ? new URLSearchParams(
        omitUndefinedValues({
          thumbnail: options.size
            ? `${Math.round(options.size * window.devicePixelRatio)}`
            : undefined,
          format: "jpg",
        })
      )
    : undefined;

  return `${url}${urlParams ? `?${urlParams}` : ""}`;
}
