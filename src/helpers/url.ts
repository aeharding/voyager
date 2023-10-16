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

// Define a mapping of websites and their regex patterns for URL transformation
const urlTransformations: { [website: string]: RegExp } = {
  "streamable.com": /(https:\/\/streamable.com\/)([a-zA-Z0-9]+)/,
  "piped.video": /(https:\/\/piped\.video\/watch\?v=)([a-zA-Z0-9_-]+)/,
  "youtube.com":
    /(https:\/\/(?:www|m)\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]+).*$/,
  "youtu.be": /(https:\/\/youtu\.be\/)([a-zA-Z0-9_-]+)/,
  // Add more websites and patterns as needed
};

// Transform known video platform urls into their embed counterparts
export const transformUrl = (inputUrl: string): string => {
  // If the URL contains gifv replace it with mp4 in order for the video to play inline
  const url = inputUrl.replace(/\.gifv/g, ".mp4");

  const matchedWebsite = Object.keys(urlTransformations).find((website) =>
    url.match(urlTransformations[website]),
  );

  if (!matchedWebsite) {
    return url; // No matching pattern found, return input URL
  }

  return url.replace(urlTransformations[matchedWebsite], (_match, p1, p2) => {
    if (matchedWebsite === "streamable.com") {
      return `${p1}e/${p2}?quality=highest`;
    }
    if (matchedWebsite === "piped.video") {
      return `${p1}${p2}`;
    }
    if (matchedWebsite === "youtube.com" || matchedWebsite === "youtu.be") {
      return `https://www.youtube.com/embed/${p2}/`;
    }

    return url; // Fallback to the input URL
  });
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

export const isUrlVideoEmbed = (url: string): boolean => {
  const parsedUrl = parseUrl(url);

  if (parsedUrl) {
    // List of known video platform hostnames
    const videoPlatforms = Object.keys(urlTransformations);

    // Check if the URL pathname contains "/embed/" or "/e/"
    const pathname = parsedUrl.pathname;
    if (pathname.includes("/embed/") || pathname.includes("/e/")) {
      return true;
    }

    // Check if the URL's hostname is in the list of video platforms
    return videoPlatforms.some((platform) =>
      parsedUrl.hostname.includes(platform),
    );
  }

  return false;
};

export const isUrlMedia = (url: string): boolean => {
  if (!url || url === "") {
    return false;
  }

  const transformedUrl = transformUrl(url);
  return (
    isUrlImage(transformedUrl) ||
    isUrlVideo(transformedUrl) ||
    isUrlVideoEmbed(transformedUrl)
  );
};
