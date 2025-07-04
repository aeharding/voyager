import { parseUrl } from "#/helpers/url";
import {
  OPostCommentShareType,
  PostCommentShareType,
} from "#/services/db/types";

export const GO_VOYAGER_HOST = "go.getvoyager.app";
export const THREADIVERSE_HOST = "threadiverse.link";

/**
 * Must use following format:
 * https://<host>/<instance>/<path>
 *
 * Instance must contain a dot, and assumed https protocol
 */
export const FEDI_REDIRECT_SERVICE_COMPATIBLE_HOSTS = [
  GO_VOYAGER_HOST,
  "lemmyverse.link",
  THREADIVERSE_HOST,
];

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

  if (
    services.includes(potentialUrl.hostname) &&
    potentialUrl.pathname.split("/")[1]?.includes(".")
  ) {
    return `https:/${potentialUrl.pathname}`;
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
