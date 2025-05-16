import { LemmyHttp } from "lemmy-js-client";

import { isNative } from "#/helpers/device";
import { reduceFileSize } from "#/helpers/imageCompress";

import nativeFetch from "./nativeFetch";

const usingNativeFetch = isNative();

const BASE_HEADERS = {
  ["User-Agent"]: "VoyagerApp/1.0",
} as const;

export function buildBaseLemmyUrl(url: string): string {
  if (import.meta.env.VITE_FORCE_LEMMY_INSECURE) {
    return `http://${url}`;
  }

  return `https://${url}`;
}

export function getClient(url: string, jwt?: string): LemmyHttp {
  return new LemmyHttp(buildBaseLemmyUrl(url), {
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

export const LIMIT = 50;

interface CustomLimit {
  maxFileSize: number;
  maxWidth: number;
  maxHeight: number;
}

const CUSTOM_LIMITS: Record<string, CustomLimit> = {
  ["lemm.ee"]: {
    maxFileSize: 490_000, // 490 kB
    maxWidth: 1200,
    maxHeight: 1200,
  },
};

// Lemmy default is 1MB
const DEFAULT_LIMIT: CustomLimit = {
  maxFileSize: 990_000, // 990 kB
  maxWidth: 1500,
  maxHeight: 1500,
};

/**
 * upload image, compressing before upload if needed
 *
 * @returns relative pictrs URL
 */
export async function _uploadImage(
  instance: string,
  client: LemmyHttp,
  image: File,
) {
  let compressedImageIfNeeded;

  const limits = CUSTOM_LIMITS[instance] ?? DEFAULT_LIMIT;

  try {
    compressedImageIfNeeded = await reduceFileSize(
      image,
      limits.maxFileSize,
      limits.maxWidth,
      limits.maxHeight,
      0.85,
    );
  } catch (error) {
    compressedImageIfNeeded = image;
    console.error("Image compress failed", error);
  }

  const response = await client.uploadImage({
    image: compressedImageIfNeeded as File,
  });

  // lemm.ee uses response.message for error messages (e.g. account too new)
  if (!response.url)
    throw new Error(response.msg ?? (response as unknown as Error).message);

  return response;
}

export const customBackOff = async (attempt = 0, maxRetries = 5) => {
  await new Promise((resolve) => {
    setTimeout(resolve, Math.min(attempt, maxRetries) * 4_000);
  });
};
