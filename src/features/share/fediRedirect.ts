import { parseUrl } from "#/helpers/url";

export const GO_VOYAGER_HOST = "go.getvoyager.app";

/**
 * Must use following format:
 * https://<host>/<instance>/<path>
 *
 * Instance must contain a dot, and assumed https protocol
 */
export const FEDI_REDIRECT_SERVICE_COMPATIBLE_HOSTS = [
  "go.getvoyager.app",
  "lemmyverse.link",
];

export function buildGoVoyagerLink(apId: string) {
  const url = parseUrl(apId);

  if (!url) return undefined;

  return `https://${GO_VOYAGER_HOST}/${url.hostname}${url.pathname}`;
}

export function extractLemmyLinkFromPotentialFediRedirectService(url: string) {
  const potentialUrl = parseUrl(url);

  if (!potentialUrl) return;

  if (
    FEDI_REDIRECT_SERVICE_COMPATIBLE_HOSTS.includes(potentialUrl.hostname) &&
    potentialUrl.pathname.split("/")[1]?.includes(".")
  ) {
    return `https:/${potentialUrl.pathname}`;
  }
}
