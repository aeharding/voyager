import {
  CommentView,
  CommunityView,
  Person,
  PersonView,
  PostView,
} from "lemmy-js-client";
import { getHandle } from "./lemmy";
import { useBuildGeneralBrowseLink } from "./routes";
import { useCallback } from "react";
import useAppToast from "./useAppToast";
import { checkmark } from "ionicons/icons";
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
    (community: CommunityView) => {
      pushRouteIfNeeded(
        buildGeneralBrowseLink(`/c/${getHandle(community.community)}`),
      );
    },
    [buildGeneralBrowseLink, pushRouteIfNeeded],
  );

  const navigateToUser = useCallback(
    (user: PersonView | Person) => {
      const person = "person" in user ? user.person : user;
      pushRouteIfNeeded(buildGeneralBrowseLink(`/u/${getHandle(person)}`));
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
