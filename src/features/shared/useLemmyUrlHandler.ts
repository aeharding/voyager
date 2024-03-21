import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { knownInstancesSelector } from "../instances/instancesSlice";
import useAppNavigation from "../../helpers/useAppNavigation";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import { normalizeObjectUrl, resolveObject } from "../resolve/resolveSlice";
import { MouseEvent } from "react";
import useAppToast from "../../helpers/useAppToast";
import { isLemmyError } from "../../helpers/lemmyErrors";
import { useOptimizedIonRouter } from "../../helpers/useOptimizedIonRouter";

export const POST_PATH = /^\/post\/(\d+)$/;
export const COMMENT_PATH = /^\/comment\/(\d+)$/;
export const USER_PATH =
  /^\/u\/([a-zA-Z0-9._%+-]+(@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})?)\/?$/;
export const COMMUNITY_PATH =
  /^\/c\/([a-zA-Z0-9._%+-]+(@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})?)\/?$/;

const POTENTIAL_PATHS = [
  POST_PATH,
  COMMENT_PATH,
  USER_PATH,
  COMMUNITY_PATH,
] as const;

type ObjectType = "community" | "post" | "comment" | "user";

export default function useLemmyUrlHandler() {
  const knownInstances = useAppSelector(knownInstancesSelector);
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );
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

  const handleCommunityClickIfNeeded = useCallback(
    (url: URL, e?: MouseEvent) => {
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
    },
    [buildGeneralBrowseLink, connectedInstance, router],
  );

  const handleUserClickIfNeeded = useCallback(
    (url: URL, e?: MouseEvent) => {
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
    },
    [connectedInstance, navigateToUser],
  );

  const handleObjectIfNeeded = useCallback(
    async (url: URL, e?: MouseEvent): Promise<boolean> => {
      const cachedResolvedObject = objectByUrl[url.toString()];
      if (cachedResolvedObject === "couldnt_find_object") return false;

      e?.preventDefault();
      e?.stopPropagation();

      let object = cachedResolvedObject;

      if (!object) {
        try {
          object = await dispatch(resolveObject(url.toString()));
        } catch (error) {
          if (isLemmyError(error, "couldnt_find_object")) {
            presentToast({
              message: `Could not find ${getObjectName(
                url.pathname,
              )} on your instance. Try again to open in browser.`,
              duration: 3500,
            });
          }

          throw error;
        }
      }

      if (object.post) {
        navigateToPost(object.post);
      } else if (object.community) {
        navigateToCommunity(object.community);
      } else if (object.person) {
        navigateToUser(object.person);
      } else if (object.comment) {
        navigateToComment(object.comment);
      } else {
        return false;
      }

      return true;
    },
    [
      dispatch,
      navigateToComment,
      navigateToCommunity,
      navigateToPost,
      navigateToUser,
      objectByUrl,
      presentToast,
    ],
  );

  const getUrl = useCallback(
    (link: string) => {
      try {
        return new URL(link, `https://${connectedInstance}`);
      } catch (error) {
        console.error("Error parsing url", error);
      }
    },
    [connectedInstance],
  );

  const determineObjectTypeFromUrl = useCallback(
    (link: string): ObjectType | undefined => {
      const url = getUrl(link);

      if (!url) return;

      if (matchLemmyCommunity(url.pathname)) return "community";

      if (!knownInstances.includes(url.hostname)) return;

      if (POST_PATH.test(url.pathname)) return "post";
      if (COMMENT_PATH.test(url.pathname)) return "comment";
      if (USER_PATH.test(url.pathname)) return "user";
    },
    [getUrl, knownInstances],
  );

  const redirectToLemmyObjectIfNeeded = useCallback(
    async (link: string, e?: MouseEvent): Promise<boolean> => {
      const url = getUrl(normalizeObjectUrl(link));

      if (!url) return false;
      if (!knownInstances.includes(url.hostname)) return false; // If non-lemmy domain, return

      if (handleCommunityClickIfNeeded(url, e)) return true;
      if (handleUserClickIfNeeded(url, e)) return true;
      if (!isPotentialObjectPath(url.pathname)) return false;

      return handleObjectIfNeeded(url, e);
    },
    [
      getUrl,
      handleCommunityClickIfNeeded,
      handleUserClickIfNeeded,
      handleObjectIfNeeded,
      knownInstances,
    ],
  );

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
  if (USER_PATH.test(urlPathname)) return "user";
  if (COMMUNITY_PATH.test(urlPathname)) return "community";
}
