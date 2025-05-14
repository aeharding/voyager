import { parseUrl } from "./url";

export function generateGoVoyagerLink(apId: string) {
  const url = parseUrl(apId);

  if (!url) return undefined;

  return `https://go.getvoyager.app/${url.hostname}${url.pathname}`;
}

export function extractLemmyLinkFromGoVoyagerLink(url: string) {
  const potentialUrl = parseUrl(url);

  if (potentialUrl?.hostname === "go.getvoyager.app" && potentialUrl.pathname) {
    return `https:/${potentialUrl.pathname}`;
  }
}
