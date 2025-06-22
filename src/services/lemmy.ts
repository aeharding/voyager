import { ThreadiverseClient } from "threadiverse";

import { reduceFileSize } from "#/helpers/imageCompress";

export const LIMIT = 50;

interface CustomLimit {
  maxFileSize: number;
  maxWidth: number;
  maxHeight: number;
}

const CUSTOM_LIMITS: Record<string, CustomLimit> = {};

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
  client: ThreadiverseClient,
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
    file: compressedImageIfNeeded as File,
  });

  // lemm.ee uses response.message for error messages (e.g. account too new)
  if (!response.url)
    throw new Error(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (response as any).msg ?? (response as unknown as Error).message,
    );

  return response;
}

export const customBackOff = async (attempt = 0, maxRetries = 5) => {
  await new Promise((resolve) => {
    setTimeout(resolve, Math.min(attempt, maxRetries) * 4_000);
  });
};
