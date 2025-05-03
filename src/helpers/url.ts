export function isValidUrl(
  potentialUrl: string,
  { checkProtocol = false, allowRelative = true } = {},
) {
  let url;

  try {
    url = new URL(
      potentialUrl,
      allowRelative ? document.location.href : undefined,
    );
  } catch (_) {
    return false;
  }

  if (!checkProtocol) return true;

  return url.protocol === "http:" || url.protocol === "https:";
}

export function getPathname(url: string): string | undefined {
  try {
    return new URL(url).pathname;
  } catch {
    return;
  }
}

export function parseUrl(url: string, baseUrl?: string): URL | undefined {
  try {
    return new URL(url, baseUrl);
  } catch {
    return;
  }
}

function getPotentialImageProxyUrl(url: URL): URL | undefined {
  if (url.pathname === "/api/v3/image_proxy") {
    const actualImageURL = url.searchParams.get("url");

    if (!actualImageURL) return;
    return parseUrl(actualImageURL);
  }

  return url;
}

const imageExtensions = ["jpeg", "png", "gif", "jpg", "webp", "jxl", "avif"];

export function isUrlImage(
  url: string,
  contentType: string | undefined,
): boolean {
  if (contentType?.startsWith("image/")) return true;

  const parsedUrl = parseUrl(url);
  if (!parsedUrl) return false;

  const unfurledUrl = getPotentialImageProxyUrl(parsedUrl);
  if (!unfurledUrl) return false;

  return imageExtensions.some((extension) =>
    unfurledUrl.pathname.endsWith(`.${extension}`),
  );
}

const animatedImageExtensions = ["gif", "webp", "jxl", "avif", "apng", "gifv"];
const animatedImageContentTypes = animatedImageExtensions.map(
  (extension) => `image/${extension}`,
);

export function isUrlPotentialAnimatedImage(
  url: string,
  contentType: string | undefined,
): boolean {
  if (contentType && animatedImageContentTypes.includes(contentType))
    return true;

  const parsedUrl = parseUrl(url);
  if (!parsedUrl) return false;

  const unfurledUrl = getPotentialImageProxyUrl(parsedUrl);
  if (!unfurledUrl) return false;

  return animatedImageExtensions.some((extension) =>
    unfurledUrl.pathname.endsWith(`.${extension}`),
  );
}

const videoExtensions = ["mp4", "webm"];

export function isUrlVideo(
  url: string,
  contentType: string | undefined,
): boolean {
  if (contentType?.startsWith("video/")) return true;

  const parsedUrl = parseUrl(url);
  if (!parsedUrl) return false;

  const unfurledUrl = getPotentialImageProxyUrl(parsedUrl);
  if (!unfurledUrl) return false;

  // Not proxied, and from imgur
  if (parsedUrl === unfurledUrl && isImgurGifv(parsedUrl)) return true;

  return videoExtensions.some((extension) =>
    unfurledUrl.pathname.endsWith(`.${extension}`),
  );
}

export function findUrlMediaType(
  url: string,
  contentType: string | undefined, // not available on older lemmy instances <0.19.6?
): "video" | "image" | undefined {
  if (isUrlImage(url, contentType)) return "image";
  if (isUrlVideo(url, contentType)) return "video";
}

// https://github.com/miguelmota/is-valid-hostname
export function isValidHostname(value: string) {
  if (typeof value !== "string") return false;

  const validHostnameChars = /^[a-zA-Z0-9-.]{1,253}\.?$/g;
  if (!validHostnameChars.test(value)) {
    return false;
  }

  if (value.endsWith(".")) {
    value = value.slice(0, value.length - 1);
  }

  if (value.length > 253) {
    return false;
  }

  const labels = value.split(".");

  const isValid = labels.every(function (label) {
    const validLabelChars = /^([a-zA-Z0-9-]+)$/g;

    const validLabel =
      validLabelChars.test(label) &&
      label.length < 64 &&
      !label.startsWith("-") &&
      !label.endsWith("-");

    return validLabel;
  });

  return isValid;
}

export function getVideoSrcForUrl(url: string) {
  const parsedUrl = parseUrl(url);
  if (!parsedUrl) return url;

  if (isImgurGifv(parsedUrl))
    return `https://${parsedUrl.hostname}${parsedUrl.pathname.replace(/\.gifv$/, ".mp4")}`;

  return url;
}

function isImgurGifv(url: URL) {
  return url.hostname === "i.imgur.com" && url.pathname.endsWith(".gifv");
}

export function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\//, "");
}

export function parseUrlForDisplay(url: string): string[] {
  let parsedUrl;

  try {
    parsedUrl = new URL(url);
  } catch (error) {
    console.error(error);
    return [];
  }

  const slashSlash = url.startsWith(`${parsedUrl.protocol}//`);

  const protocolPrefix =
    parsedUrl.protocol === "https:"
      ? ""
      : `${parsedUrl.protocol}${slashSlash ? "//" : ""}`;
  const normalizedHost = (() => {
    if (protocolPrefix) return parsedUrl.host;
    if (parsedUrl.host.startsWith("www.")) return parsedUrl.host.slice(4);

    return parsedUrl.host;
  })();

  return [
    `${protocolPrefix}${normalizedHost}`,
    `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`,
  ];
}

export function determineTypeFromUrl(url: string): "mail" | undefined {
  return url.startsWith("mailto:") ? "mail" : undefined;
}

export function forceSecureUrl(url: string): string;
export function forceSecureUrl(url: string | undefined): string | undefined {
  if (!url) return url;
  if (url.startsWith("http://")) return url.replace(/^http:\/\//, "https://");
  return url;
}
