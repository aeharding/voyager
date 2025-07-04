import { parseUrl } from "#/helpers/url";
import {
  OPostCommentShareType,
  PostCommentShareType,
} from "#/services/db/types";

export const GO_VOYAGER_HOST = "vger.to";
export const THREADIVERSE_HOST = "threadiverse.link";

/**
 * Must use following format:
 * https://<host>/<instance>/<path>
 *
 * Instance must contain a dot, and assumed https protocol
 */
export const FEDI_REDIRECT_SERVICE_COMPATIBLE_HOSTS = [
  GO_VOYAGER_HOST,
  "go.getvoyager.app",
  "lemmyverse.link",
  THREADIVERSE_HOST,
  "lemsha.re",
];

const SUPPORTS_SCHEMA_PREFIX = ["lemsha.re"];

export function buildFediRedirectLink(fediRedirectHost: string, apId: string) {
  const url = parseUrl(apId);

  if (!url) return undefined;

  return `https://${fediRedirectHost}/${url.hostname}${url.pathname}`;
}

export function extractLemmyLinkFromPotentialFediRedirectService(
  url: string,
  services = FEDI_REDIRECT_SERVICE_COMPATIBLE_HOSTS,
) {
  const potentialUrl = parseUrl(url);

  if (!potentialUrl) return;

  const potentialFediRedirectServiceHost = potentialUrl.hostname;

  if (!services.includes(potentialFediRedirectServiceHost)) return;

  const endpoint = potentialUrl.pathname.slice(1);

  if (endpoint.split("/")[0]?.includes(".")) {
    return `https://${endpoint}`;
  } else if (
    endpoint.startsWith("https://") &&
    SUPPORTS_SCHEMA_PREFIX.includes(potentialFediRedirectServiceHost)
  ) {
    return `https://${endpoint.slice(8)}`;
  }
}

export function getFediRedirectHostFromShareType(
  shareType: PostCommentShareType,
): string | undefined {
  switch (shareType) {
    case OPostCommentShareType.Threadiverse:
      return THREADIVERSE_HOST;
    case OPostCommentShareType.DeepLink:
      return GO_VOYAGER_HOST;
  }
}
