import { parseUrl } from "#/helpers/url";

export const GO_VOYAGER_HOST = "go.getvoyager.app";

export function buildGoVoyagerLink(apId: string) {
  const url = parseUrl(apId);

  if (!url) return undefined;

  return `https://${GO_VOYAGER_HOST}/${url.hostname}${url.pathname}`;
}

export function extractLemmyLinkFromPotentialGoVoyagerLink(url: string) {
  const potentialUrl = parseUrl(url);

  if (potentialUrl?.hostname === GO_VOYAGER_HOST && potentialUrl.pathname) {
    return `https:/${potentialUrl.pathname}`;
  }
}
