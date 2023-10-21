import { LinkHTMLAttributes, MouseEvent, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import { useIonRouter } from "@ionic/react";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import styled from "@emotion/styled";
import InAppExternalLink from "../InAppExternalLink";
import { knownInstancesSelector } from "../../instances/instancesSlice";
import { getHandle } from "../../../helpers/lemmy";
import { resolveObject } from "../../resolve/resolveSlice";
import useAppToast from "../../../helpers/useAppToast";

const POST_PATH = /^\/post\/(\d+)$/;
const COMMENT_PATH = /^\/comment\/(\d+)$/;
const USER_PATH =
  /^\/u\/([a-zA-Z0-9._%+-]+(@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})?)\/?$/;
const COMMUNITY_PATH =
  /^\/c\/([a-zA-Z0-9._%+-]+(@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})?)\/?$/;

const POTENTIAL_PATHS = [
  POST_PATH,
  COMMENT_PATH,
  USER_PATH,
  COMMUNITY_PATH,
] as const;

const LinkInterceptor = styled(LinkInterceptorUnstyled)`
  -webkit-touch-callout: default;
`;

function LinkInterceptorUnstyled(props: LinkHTMLAttributes<HTMLAnchorElement>) {
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );
  const router = useIonRouter();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const knownInstances = useAppSelector(knownInstancesSelector);
  const dispatch = useAppDispatch();
  const presentToast = useAppToast();
  const objectByUrl = useAppSelector((state) => state.resolve.objectByUrl);

  const onClick = useCallback(
    async (e: MouseEvent) => {
      if (!props.href) return;
      if (e.metaKey || e.ctrlKey) return;

      const url = new URL(props.href, `https://${connectedInstance}`);
      if (!knownInstances.includes(url.hostname)) return; // If non-lemmy domain, return

      handleCommunityClickIfNeeded();
      if (e.defaultPrevented) return;
      await handleObjectIfNeeded();

      function handleCommunityClickIfNeeded() {
        const matchedCommunityHandle = matchLemmyCommunity(url.pathname);

        if (!matchedCommunityHandle) return;
        const [communityName, domain] = matchedCommunityHandle;

        e.preventDefault();
        e.stopPropagation();

        if (
          (!domain && url.hostname === connectedInstance) ||
          (domain === url.hostname && domain === connectedInstance)
        ) {
          router.push(buildGeneralBrowseLink(`/c/${communityName}`));
          return;
        }

        router.push(
          buildGeneralBrowseLink(
            `/c/${communityName}@${domain ?? url.hostname}`,
          ),
        );
      }

      async function handleObjectIfNeeded() {
        if (!isPotentialObjectPath(url.pathname)) return;
        const cachedResolvedObject = objectByUrl[url.toString()];
        if (cachedResolvedObject === "couldnt_find_object") return;

        e.preventDefault();
        e.stopPropagation();

        let object = cachedResolvedObject;

        if (!object) {
          try {
            object = await dispatch(resolveObject(url.toString()));
          } catch (error) {
            if (error === "couldnt_find_object") {
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
          router.push(
            buildGeneralBrowseLink(
              `/c/${getHandle(object.post.community)}/comments/${
                object.post.post.id
              }`,
            ),
          );
        } else if (object.community) {
          router.push(
            buildGeneralBrowseLink(
              `/c/${getHandle(object.community.community)}`,
            ),
          );
        } else if (object.person) {
          router.push(
            buildGeneralBrowseLink(`/u/${getHandle(object.person.person)}`),
          );
        } else if (object.comment) {
          router.push(
            buildGeneralBrowseLink(
              `/c/${getHandle(object.comment.community)}/comments/${
                object.comment.post.id
              }/${object.comment.comment.path}`,
            ),
          );
        }
      }
    },
    [
      buildGeneralBrowseLink,
      connectedInstance,
      props.href,
      router,
      knownInstances,
      dispatch,
      presentToast,
      objectByUrl,
    ],
  );

  return (
    <InAppExternalLink
      {...props}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
    />
  );
}

export function matchLemmyCommunity(
  urlPathname: string,
): [string, string] | [string] | null {
  const matches = urlPathname.match(COMMUNITY_PATH);
  if (matches && matches[1]) {
    const [communityName, domain] = matches[1].split("@");
    if (!domain) return [communityName];
    return [communityName, domain];
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

export default LinkInterceptor;
