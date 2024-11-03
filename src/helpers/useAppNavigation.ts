import { checkmark } from "ionicons/icons";
import {
  CommentView,
  Community,
  CommunityView,
  Person,
  PersonView,
  PostView,
} from "lemmy-js-client";
import { useCallback } from "react";

import { buildCommunityLink } from "./appLinkBuilder";
import { getHandle } from "./lemmy";
import { useBuildGeneralBrowseLink } from "./routes";
import useAppToast from "./useAppToast";
import { useOptimizedIonRouter } from "./useOptimizedIonRouter";

export default function useAppNavigation() {
  const router = useOptimizedIonRouter();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const presentToast = useAppToast();

  const pushRouteIfNeeded = useCallback(
    (route: string) => {
      if (router.getRouteInfo()?.pathname === route) {
        presentToast({
          message: "You're already here!",
          position: "top",
          centerText: true,
          icon: checkmark,
        });
        return;
      }

      router.push(route);
    },
    [router, presentToast],
  );

  const navigateToPost = useCallback(
    (post: PostView) => {
      pushRouteIfNeeded(
        buildGeneralBrowseLink(
          `/c/${getHandle(post.community)}/comments/${post.post.id}`,
        ),
      );
    },
    [buildGeneralBrowseLink, pushRouteIfNeeded],
  );

  const navigateToCommunity = useCallback(
    (community: CommunityView | Community) => {
      pushRouteIfNeeded(
        buildGeneralBrowseLink(
          buildCommunityLink(
            "community" in community ? community.community : community,
          ),
        ),
      );
    },
    [buildGeneralBrowseLink, pushRouteIfNeeded],
  );

  const navigateToUser = useCallback(
    (user: PersonView | Person | string) => {
      const getPath = (handle: string) => `/u/${handle}`;

      if (typeof user === "string") {
        pushRouteIfNeeded(buildGeneralBrowseLink(getPath(user)));
        return;
      }

      const person = "person" in user ? user.person : user;
      pushRouteIfNeeded(buildGeneralBrowseLink(getPath(getHandle(person))));
    },
    [buildGeneralBrowseLink, pushRouteIfNeeded],
  );

  const navigateToComment = useCallback(
    (comment: CommentView) => {
      pushRouteIfNeeded(
        buildGeneralBrowseLink(
          `/c/${getHandle(comment.community)}/comments/${comment.post.id}/${
            comment.comment.path
          }`,
        ),
      );
    },
    [buildGeneralBrowseLink, pushRouteIfNeeded],
  );

  return {
    navigateToComment,
    navigateToCommunity,
    navigateToPost,
    navigateToUser,
  };
}
