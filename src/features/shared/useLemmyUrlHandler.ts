import { MouseEvent } from "react";

import { knownInstancesSelector } from "#/features/instances/instancesSlice";
import {
  normalizeObjectUrl,
  resolveObject,
} from "#/features/resolve/resolveSlice";
import { isLemmyError } from "#/helpers/lemmyErrors";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import useAppNavigation from "#/helpers/useAppNavigation";
import useAppToast from "#/helpers/useAppToast";
import { useOptimizedIonRouter } from "#/helpers/useOptimizedIonRouter";
import { buildBaseLemmyUrl } from "#/services/lemmy";
import { useAppDispatch, useAppSelector } from "#/store";

export const POST_PATH = /^\/post\/(\d+)$/;

export const COMMENT_PATH = /^\/comment\/(\d+)$/;

/**
 * Lemmy 0.19.4 added a new url format to reference comments,
 * in addition to `COMMENT_PATH`.
 *
 * It is functionally exactly the same. IDK why
 *
 * https://github.com/LemmyNet/lemmy-ui/commit/b7fe70d8c15fe8c8482c8403744f24f63d1c505a#diff-13e07e23177266e419a34a839636bcdbd2f6997000fb8e0f3be26c78400acf77R145
 */
export const COMMENT_VIA_POST_PATH = /^\/post\/\d+\/(\d+)$/;

export const USER_PATH =
  /^\/u\/([a-zA-Z0-9._%+-]+(@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})?)\/?$/;
export const COMMUNITY_PATH =
  /^\/c\/([a-zA-Z0-9._%+-]+(@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})?)\/?$/;

const POTENTIAL_PATHS = [
  POST_PATH,
  COMMENT_PATH,
  COMMENT_VIA_POST_PATH,
  USER_PATH,
  COMMUNITY_PATH,
] as const;

export type LemmyObjectType = "community" | "post" | "comment" | "user";

export default function useLemmyUrlHandler() {
  const knownInstances = useAppSelector(knownInstancesSelector);
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );
  const connectedInstanceUrl = buildBaseLemmyUrl(connectedInstance);
  const objectByUrl = useAppSelector((state) => state.resolve.objectByUrl);
  const {
    navigateToComment,
    navigateToCommunity,
    navigateToPost,
    navigateToUser,
  } = useAppNavigation();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const router = useOptimizedIonRouter();
  const dispatch = useAppDispatch();
  const presentToast = useAppToast();

  function handleCommunityClickIfNeeded(url: URL, e?: MouseEvent) {
    const matchedCommunityHandle = matchLemmyCommunity(url.pathname);

    if (!matchedCommunityHandle) return;
    const [communityName, domain] = matchedCommunityHandle;

    e?.preventDefault();
    e?.stopPropagation();

    if (
      (!domain && url.hostname === connectedInstance) ||
      (domain === url.hostname && domain === connectedInstance)
    ) {
      router.push(buildGeneralBrowseLink(`/c/${communityName}`));
      return true;
    }

    router.push(
      buildGeneralBrowseLink(`/c/${communityName}@${domain ?? url.hostname}`),
    );

    return true;
  }

  function handleUserClickIfNeeded(url: URL, e?: MouseEvent) {
    const matchedUserHandle = matchLemmyUser(url.pathname);

    if (!matchedUserHandle) return;
    const [userName, domain] = matchedUserHandle;

    e?.preventDefault();
    e?.stopPropagation();

    if (
      (!domain && url.hostname === connectedInstance) ||
      (domain === url.hostname && domain === connectedInstance)
    ) {
      navigateToUser(userName);
      return true;
    }

    navigateToUser(`${userName}@${domain ?? url.hostname}`);

    return true;
  }

  async function handleObjectIfNeeded(
    url: URL,
    e?: MouseEvent,
  ): Promise<"already-there" | "not-found" | "success"> {
    const cachedResolvedObject = objectByUrl[url.toString()];
    if (cachedResolvedObject === "couldnt_find_object") return "not-found";

    e?.preventDefault();
    e?.stopPropagation();

    let object = cachedResolvedObject;

    if (!object) {
      try {
        object = await dispatch(resolveObject(url.toString()));
      } catch (error) {
        if (
          // TODO START lemmy 0.19 and less support
          isLemmyError(error, "couldnt_find_object" as never) ||
          isLemmyError(error, "couldnt_find_post" as never) ||
          isLemmyError(error, "couldnt_find_comment" as never) ||
          isLemmyError(error, "couldnt_find_person" as never) ||
          isLemmyError(error, "couldnt_find_community" as never) ||
          // TODO END
          isLemmyError(error, "not_found")
        ) {
          presentToast({
            message: `Could not find ${getObjectName(
              url.pathname,
            )} on your instance. Try again to open in browser.`,
            duration: 3500,
            color: "warning",
          });
        }

        throw error;
      }
    }

    if (object.post) {
      return navigateToPost(object.post);
    } else if (object.community) {
      return navigateToCommunity(object.community);
    } else if (object.person) {
      return navigateToUser(object.person);
    } else if (object.comment) {
      return navigateToComment(object.comment);
    }

    return "not-found";
  }

  function getUrl(link: string) {
    try {
      return new URL(link, connectedInstanceUrl);
    } catch (error) {
      console.error("Error parsing url", error);
    }
  }

  function determineObjectTypeFromUrl(
    link: string,
  ): LemmyObjectType | undefined {
    const url = getUrl(link);

    if (!url) return;

    if (matchLemmyCommunity(url.pathname)) return "community";

    if (!knownInstances.includes(url.hostname)) return;

    if (POST_PATH.test(url.pathname)) return "post";
    if (COMMENT_PATH.test(url.pathname)) return "comment";
    if (COMMENT_VIA_POST_PATH.test(url.pathname)) return "comment";
    if (USER_PATH.test(url.pathname)) return "user";
  }

  async function redirectToLemmyObjectIfNeeded(
    link: string,
    e?: MouseEvent,

    /**
     * If its a known Lemmy link, bypass checking link domain against known instances list
     * (this helps with new instances that aren't well federated yet)
     */
    forceResolveObject = false,
  ): Promise<"not-found" | "already-there" | "success"> {
    const url = getUrl(normalizeObjectUrl(link));

    if (!url) return "not-found";
    if (!forceResolveObject && !knownInstances.includes(url.hostname))
      return "not-found"; // If non-lemmy domain, return

    if (handleCommunityClickIfNeeded(url, e)) return "success";
    if (handleUserClickIfNeeded(url, e)) return "success";
    if (!isPotentialObjectPath(url.pathname)) return "not-found";

    return handleObjectIfNeeded(url, e);
  }

  return {
    determineObjectTypeFromUrl,
    redirectToLemmyObjectIfNeeded,
  };
}

export function matchLemmyCommunity(
  urlPathname: string,
): [string, string] | [string] | null {
  const matches = urlPathname.match(COMMUNITY_PATH);
  if (matches && matches[1]) {
    const [communityName, domain] = matches[1].split("@");
    if (!domain) return [communityName!];
    return [communityName!, domain];
  }
  return null;
}

export function matchLemmyUser(
  urlPathname: string,
): [string, string] | [string] | null {
  const matches = urlPathname.match(USER_PATH);
  if (matches && matches[1]) {
    const [userName, domain] = matches[1].split("@");
    if (!domain) return [userName!];
    return [userName!, domain];
  }
  return null;
}

function isPotentialObjectPath(urlPathname: string): boolean {
  for (const regex of POTENTIAL_PATHS) {
    if (regex.test(urlPathname)) return true;
  }

  return false;
}

function getObjectName(urlPathname: string): string | undefined {
  if (POST_PATH.test(urlPathname)) return "post";
  if (COMMENT_PATH.test(urlPathname)) return "comment";
  if (COMMENT_VIA_POST_PATH.test(urlPathname)) return "comment";
  if (USER_PATH.test(urlPathname)) return "user";
  if (COMMUNITY_PATH.test(urlPathname)) return "community";
}
