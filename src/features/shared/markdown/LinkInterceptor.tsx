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
import {
  CommentView,
  CommunityView,
  PersonView,
  PostView,
} from "lemmy-js-client";
import useClient from "../../../helpers/useClient";
import { getPost } from "../../post/postSlice";

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
  const client = useClient();

  const onClick = useCallback(
    async (e: MouseEvent) => {
      if (!props.href) return;
      if (e.metaKey || e.ctrlKey) return;

      const url = new URL(props.href, `https://${connectedInstance}`);
      if (!knownInstances.includes(url.hostname)) return; // If non-lemmy domain, return

      handleCommunityClickIfNeeded();
      if (e.defaultPrevented) return;
      if (!isPotentialObjectPath(url.pathname)) return;
      if (url.hostname !== connectedInstance) {
        await handleRemoteObjectIfNeeded();
      } else {
        await handleLocalObjectIfNeeded();
      }

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

      async function handleRemoteObjectIfNeeded() {
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
          navigateToPost(object.post);
        } else if (object.community) {
          navigateToCommunity(object.community);
        } else if (object.person) {
          navigateToUser(object.person);
        } else if (object.comment) {
          navigateToComment(object.comment);
        }
      }

      async function handleLocalObjectIfNeeded() {
        e.preventDefault();
        e.stopPropagation();

        const commentMatch = COMMENT_PATH.exec(url.pathname);
        if (commentMatch) {
          const commentId = +commentMatch[1];

          let comment_view;

          try {
            ({ comment_view } = await client.getComment({ id: commentId }));
          } catch (error) {
            presentToast({
              message: "Comment not found",
            });
            throw error;
          }
          navigateToComment(comment_view);
          return;
        }

        const postMatch = POST_PATH.exec(url.pathname);
        if (postMatch) {
          const postId = +postMatch[1];

          let post_view;

          try {
            ({ post_view } = await dispatch(getPost(postId)));
          } catch (error) {
            presentToast({
              message: "Post not found",
            });
            throw error;
          }
          navigateToPost(post_view);
          return;
        }

        // Community links should be handled already

        const matchedUserHandle = matchLemmyUser(url.pathname);

        if (matchedUserHandle) {
          const [userName, domain] = matchedUserHandle;

          if (!domain || domain === connectedInstance) {
            router.push(buildGeneralBrowseLink(`/u/${userName}`));
          } else {
            router.push(buildGeneralBrowseLink(`/u/${userName}@${domain}`));
          }
        }
      }

      function navigateToPost(post: PostView) {
        router.push(
          buildGeneralBrowseLink(
            `/c/${getHandle(post.community)}/comments/${post.post.id}`,
          ),
        );
      }

      function navigateToCommunity(community: CommunityView) {
        router.push(
          buildGeneralBrowseLink(`/c/${getHandle(community.community)}`),
        );
      }

      function navigateToUser(user: PersonView) {
        router.push(buildGeneralBrowseLink(`/u/${getHandle(user.person)}`));
      }

      function navigateToComment(comment: CommentView) {
        router.push(
          buildGeneralBrowseLink(
            `/c/${getHandle(comment.community)}/comments/${comment.post.id}/${
              comment.comment.path
            }`,
          ),
        );
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
      client,
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

export function matchLemmyUser(
  urlPathname: string,
): [string, string] | [string] | null {
  const matches = urlPathname.match(USER_PATH);
  if (matches && matches[1]) {
    const [userName, domain] = matches[1].split("@");
    if (!domain) return [userName];
    return [userName, domain];
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
