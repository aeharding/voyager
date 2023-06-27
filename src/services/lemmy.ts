import { LemmyHttp } from "lemmy-js-client";

function buildBaseUrl(url: string): string {
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
  const formData = new FormData();

  formData.append("images[]", image);

  const response = await fetch(
    `${buildBaseUrl(url)}${PICTRS_URL}?${new URLSearchParams({ auth })}`,
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
