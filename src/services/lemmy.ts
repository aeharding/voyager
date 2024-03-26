import { LemmyHttp } from "lemmy-js-client";
import { reduceFileSize } from "../helpers/imageCompress";
import { isNative, supportsWebp } from "../helpers/device";
import nativeFetch from "./nativeFetch";

function buildBaseUrl(url: string): string {
  return `https://${url}`;
}

export function getClient(url: string, jwt?: string): LemmyHttp {
  return new LemmyHttp(buildBaseUrl(url), {
    fetchFunction: isNative() ? nativeFetch : fetch.bind(globalThis),
    headers: jwt
      ? {
          Authorization: `Bearer ${jwt}`,
        }
      : undefined,
  });
}

export const LIMIT = 50;

/**
 * upload image, compressing before upload if needed
 *
 * @returns relative pictrs URL
 */
export async function uploadImage(client: LemmyHttp, image: File) {
  let compressedImageIfNeeded;

  try {
    compressedImageIfNeeded = await reduceFileSize(
      image,
      990_000, // 990 kB - Lemmy's default limit is 1MB
      1500,
      1500,
      0.85,
    );
  } catch (error) {
    compressedImageIfNeeded = image;
    console.error("Image compress failed", error);
  }

  const response = await client.uploadImage({
    image: compressedImageIfNeeded as File,
  });

  if (!response.url) throw new Error(response.msg);

  return response.url;
}

interface ImageOptions {
  /**
   * maximum image dimension
   */
  size?: number;

  devicePixelRatio?: number;

  format?: "jpg" | "png" | "webp";
}

const defaultFormat = supportsWebp() ? "webp" : "jpg";

export function getImageSrc(url: string, options?: ImageOptions) {
  if (!options || !options.size) return url;

  let mutableUrl;

  try {
    mutableUrl = new URL(url);
  } catch (error) {
    return url;
  }

  const params = mutableUrl.searchParams;

  if (options.size) {
    params.set(
      "thumbnail",
      `${Math.round(
        options.size * (options?.devicePixelRatio ?? window.devicePixelRatio),
      )}`,
    );
  }

  params.set("format", options.format ?? defaultFormat);

  return mutableUrl.toString();
}

export const customBackOff = async (attempt = 0, maxRetries = 5) => {
  await new Promise((resolve) => {
    setTimeout(resolve, Math.min(attempt, maxRetries) * 4_000);
  });
};
