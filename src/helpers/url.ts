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

function getPathname(url: string): string | undefined {
  try {
    return new URL(url).pathname;
  } catch {
    return;
  }
}

const imageExtensions = ["jpeg", "png", "gif", "gifv", "jpg", "webp", "jxl"];

export function isUrlImage(url: string): boolean {
  const pathname = getPathname(url);

  if (!pathname) return false;

  return imageExtensions.some((extension) =>
    pathname.endsWith(`.${extension}`),
  );
}

const animatedImageExtensions = ["gif", "gifv", "webp", "jxl"];

export function isUrlPotentialAnimatedImage(url: string): boolean {
  const pathname = getPathname(url);

  if (!pathname) return false;

  return animatedImageExtensions.some((extension) =>
    pathname.endsWith(`.${extension}`),
  );
}

const videoExtensions = ["mp4", "webm"];

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
