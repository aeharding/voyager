export function isValidUrl(potentialUrl: string, checkProtocol = false) {
  let url;

  try {
    url = new URL(potentialUrl);
  } catch (_) {
    return false;
  }

  if (!checkProtocol) return true;

  return url.protocol === "http:" || url.protocol === "https:";
}
