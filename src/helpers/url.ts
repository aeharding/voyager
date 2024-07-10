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

const imageExtensions = ["jpeg", "png", "gif", "jpg", "webp", "jxl"];

export function isUrlImage(url: string): boolean {
  const pathname = getPathname(url);

  if (!pathname) return false;

  return imageExtensions.some((extension) =>
    pathname.endsWith(`.${extension}`),
  );
}

const animatedImageExtensions = ["gif", "webp", "jxl"];

export function isUrlPotentialAnimatedImage(url: string): boolean {
  const pathname = getPathname(url);

  if (!pathname) return false;

  return animatedImageExtensions.some((extension) =>
    pathname.endsWith(`.${extension}`),
  );
}

const videoExtensions = ["mp4", "webm", "gifv"];

export function isUrlVideo(url: string): boolean {
  const pathname = getPathname(url);
  if (!pathname) return false;

  return videoExtensions.some((extension) =>
    pathname.endsWith(`.${extension}`),
  );
}

export function isUrlMedia(url: string): boolean {
  return isUrlImage(url) || isUrlVideo(url);
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
  let parsedUrl;

  try {
    parsedUrl = new URL(url);
  } catch (error) {
    console.error(error);
    return url;
  }

  const { hostname, pathname } = parsedUrl;

  if (hostname === "i.imgur.com" && pathname.endsWith(".gifv"))
    return `https://${hostname}${pathname.replace(/\.gifv$/, ".mp4")}`;

  return url;
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

// https://stackoverflow.com/a/61033353/1319878
const YOUTUBE_LINK =
  /(?:https?:\/\/)?(?:www\.)?youtu(?:\.be\/|be.com\/\S*(?:watch|embed)(?:(?:(?=\/[-a-zA-Z0-9_]{11,}(?!\S))\/)|(?:\S*v=|v\/)))([-a-zA-Z0-9_]{11,})/;

export function determineTypeFromUrl(
  url: string,
): "mail" | "youtube" | undefined {
  if (url.startsWith("mailto:")) return "mail";

  if (YOUTUBE_LINK.test(url)) return "youtube";
}

export function getYoutubeVideoId(url: string): string | undefined {
  return url.match(YOUTUBE_LINK)?.[1];
}

export function getYoutubeThumbnailSrc(url: string): string | undefined {
  const videoId = getYoutubeVideoId(url);

  if (!videoId) return;

  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}
