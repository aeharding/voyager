export function isValidUrl(potentialUrl: string) {
  let url;

  try {
    url = new URL(potentialUrl);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}
