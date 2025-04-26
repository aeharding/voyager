import {
  CommentView,
  Community,
  CommunityView,
  Person,
  PersonView,
  PostView,
} from "lemmy-js-client";
import { use } from "react";

import { OutletContext } from "#/routes/Outlet";
import { useIsSecondColumn } from "#/routes/twoColumn/useIsSecondColumn";

import { buildCommunityLink } from "./appLinkBuilder";
import { getHandle } from "./lemmy";
import { useBuildGeneralBrowseLink } from "./routes";
import { alreadyHere } from "./toastMessages";
import useAppToast from "./useAppToast";
import { useOptimizedIonRouter } from "./useOptimizedIonRouter";

export default function useAppNavigation() {
  const router = useOptimizedIonRouter();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const presentToast = useAppToast();
  const { setPostDetail } = use(OutletContext);
  const isSecondColumn = useIsSecondColumn();

  function pushRouteIfNeeded(route: string) {
    if (router.getRouteInfo()?.pathname === route) {
      presentToast(alreadyHere);
      return "already-there";
    }

    router.push(route);
    return "success";
  }

  function navigateToPost(post: PostView) {
    if (!isSecondColumn) {
      setPostDetail({
        id: `${post.post.id}`,
        community: getHandle(post.community),
      });
      return "success"; // TODO: return if already there
    }

    return pushRouteIfNeeded(
      buildGeneralBrowseLink(
        `/c/${getHandle(post.community)}/comments/${post.post.id}`,
      ),
    );
  }

  function navigateToCommunity(community: CommunityView | Community) {
    return pushRouteIfNeeded(
      buildGeneralBrowseLink(
        buildCommunityLink(
          "community" in community ? community.community : community,
        ),
      ),
    );
  }

  function navigateToUser(user: PersonView | Person | string) {
    const getPath = (handle: string) => `/u/${handle}`;

    if (typeof user === "string") {
      return pushRouteIfNeeded(buildGeneralBrowseLink(getPath(user)));
    }

    const person = "person" in user ? user.person : user;
    return pushRouteIfNeeded(
      buildGeneralBrowseLink(getPath(getHandle(person))),
    );
  }

  function navigateToComment(comment: CommentView) {
    if (!isSecondColumn) {
      setPostDetail({
        id: `${comment.post.id}`,
        community: getHandle(comment.community),
        commentPath: comment.comment.path,
      });
      return "success"; // TODO: return if already there
    }

    return pushRouteIfNeeded(
      buildGeneralBrowseLink(
        `/c/${getHandle(comment.community)}/comments/${comment.post.id}/${
          comment.comment.path
        }`,
      ),
    );
  }

  return {
    navigateToComment,
    navigateToCommunity,
    navigateToPost,
    navigateToUser,
  };
}
