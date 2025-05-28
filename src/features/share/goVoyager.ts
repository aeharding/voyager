import { parseUrl } from "#/helpers/url";

export const GO_VOYAGER_HOST = "go.getvoyager.app";

export const GO_VOYAGER_REDIRECT_SERVICE_COMPATIBLE_HOSTS = [
  "go.getvoyager.app",
  "lemmyverse.link",
];

export function buildGoVoyagerLink(apId: string) {
  const url = parseUrl(apId);

  if (!url) return undefined;

  return `https://${GO_VOYAGER_HOST}/${url.hostname}${url.pathname}`;
}

export function extractLemmyLinkFromPotentialGoVoyagerLink(url: string) {
  const potentialUrl = parseUrl(url);

  if (!potentialUrl) return;

  if (
    GO_VOYAGER_REDIRECT_SERVICE_COMPATIBLE_HOSTS.includes(
      potentialUrl.hostname,
    ) &&
    potentialUrl.pathname.split("/")[1]?.includes(".")
  ) {
    return `https:/${potentialUrl.pathname}`;
  }
}
