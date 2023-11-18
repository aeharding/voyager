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

const imageExtensions = ["jpeg", "png", "gif", "jpg", "webp"];

export function isUrlImage(url: string): boolean {
  return imageExtensions.some((extension) => url.endsWith(`.${extension}`));
}

const videoExtensions = ["mp4", "webm"];

export function isUrlVideo(url: string): boolean {
  return videoExtensions.some((extension) => url.endsWith(`.${extension}`));
}

export function isUrlMedia(url: string): boolean {
  return isUrlImage(url) || isUrlVideo(url);
}
