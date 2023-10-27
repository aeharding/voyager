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

// Transform known video platform urls into their embed counterparts
export const transformUrl = (inputUrl: string): string => {
  // If the URL contains gifv replace it with mp4 in order for the video to play inline
  const url = inputUrl.replace(/\.gifv/g, ".mp4");

  return url;
};

const parseUrl = (url: string): URL | null => {
  try {
    return new URL(url);
  } catch (error) {
    console.error(error);
    return null;
  }
};

export function isUrlImage(url: string): boolean {
  const parsedUrl = parseUrl(url);

  if (!parsedUrl) {
    return false;
  }

  return (
    parsedUrl.pathname.endsWith(".jpeg") ||
    parsedUrl.pathname.endsWith(".png") ||
    parsedUrl.pathname.endsWith(".gif") ||
    parsedUrl.pathname.endsWith(".jpg") ||
    parsedUrl.pathname.endsWith(".webp")
  );
}

export const isUrlVideo = (url: string): boolean => {
  const parsedUrl = parseUrl(url);

  if (parsedUrl) {
    // Check if the URL contains ".mp4" in its pathname
    url = parsedUrl.pathname.toLowerCase();
    return url.includes(".mp4") || url.includes(".mov");
  }

  return false;
};

export const isUrlMedia = (url: string): boolean => {
  if (!url || url === "") {
    return false;
  }

  const transformedUrl = transformUrl(url);
  return isUrlImage(transformedUrl) || isUrlVideo(transformedUrl);
};
