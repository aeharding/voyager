import { useIonRouter } from "@ionic/react";
import {
  CommentView,
  CommunityView,
  PersonView,
  PostView,
} from "lemmy-js-client";
import { getHandle } from "./lemmy";
import { useBuildGeneralBrowseLink } from "./routes";
import { useCallback } from "react";

export default function useAppNavigation() {
  const router = useIonRouter();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  const navigateToPost = useCallback(
    (post: PostView) => {
      router.push(
        buildGeneralBrowseLink(
          `/c/${getHandle(post.community)}/comments/${post.post.id}`,
        ),
      );
    },
    [buildGeneralBrowseLink, router],
  );

  const navigateToCommunity = useCallback(
    (community: CommunityView) => {
      router.push(
        buildGeneralBrowseLink(`/c/${getHandle(community.community)}`),
      );
    },
    [buildGeneralBrowseLink, router],
  );

  const navigateToUser = useCallback(
    (user: PersonView) => {
      router.push(buildGeneralBrowseLink(`/u/${getHandle(user.person)}`));
    },
    [buildGeneralBrowseLink, router],
  );

  const navigateToComment = useCallback(
    (comment: CommentView) => {
      router.push(
        buildGeneralBrowseLink(
          `/c/${getHandle(comment.community)}/comments/${comment.post.id}/${
            comment.comment.path
          }`,
        ),
      );
    },
    [buildGeneralBrowseLink, router],
  );

  return {
    navigateToComment,
    navigateToCommunity,
    navigateToPost,
    navigateToUser,
  };
}
