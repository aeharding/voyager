import { LemmyHttp } from "lemmy-js-client";
import { reduceFileSize } from "../helpers/imageCompress";

const UNPROXIED_LEMMY_SERVERS = [
  "lemmy.ml",
  "beehaw.org",
  "sh.itjust.works",
  "lemm.ee",
  "feddit.de",
  "midwest.social",
  "lemmynsfw.com",
  "lemmy.ca",
  "lemmy.sdf.org",
  "lemmy.world",
];

function buildBaseUrl(url: string): string {
  if (UNPROXIED_LEMMY_SERVERS.includes(url)) {
    return `https://${url}`;
  }

  return buildProxiedBaseUrl(url);
}

function buildProxiedBaseUrl(url: string): string {
  return `${location.origin}/api/${url}`;
}

export function getClient(url: string): LemmyHttp {
  return new LemmyHttp(buildBaseUrl(url));
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
