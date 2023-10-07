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
  "youtube.com": /(https:\/\/www.youtube.com\/watch\?v=)([a-zA-Z0-9_-]+)/,
  // Add more websites and patterns as needed
};

// Transform known video platform urls into their embed counterparts
export const transformUrl = (inputUrl: string): string => {
  for (const website in urlTransformations) {
    if (inputUrl.match(urlTransformations[website])) {
      return inputUrl.replace(urlTransformations[website], (match, p1, p2) => {
        if (website === "streamable.com") {
          return `${p1}e/${p2}?quality=highest`;
        } else if (website === "piped.video") {
          return `${p1}${p2}`;
        } else if (website === "youtube.com") {
          return `https://www.youtube.com/embed/${p2}/`;
        }
      });
    }
  }
  return inputUrl; // Return the input URL if no matching pattern is found
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
    return parsedUrl.pathname.toLowerCase().includes(".mp4");
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
  return isUrlImage(url) || isUrlVideo(url) || isUrlVideoEmbed(url);
};
