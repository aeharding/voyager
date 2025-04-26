import { Comment, Community, Post } from "lemmy-js-client";
import { use } from "react";

import { buildCommentLink, buildPostLink } from "#/helpers/appLinkBuilder";
import { getHandle } from "#/helpers/lemmy";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import { useOptimizedIonRouter } from "#/helpers/useOptimizedIonRouter";

import { OutletContext } from "../Outlet";

export function useOpenPostCommentProps(
  item: Post | Comment,
  community: Community,
) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const { setPostDetail, isTwoColumnLayout } = use(OutletContext);
  const router = useOptimizedIonRouter();

  return {
    routerLink: buildGeneralBrowseLink(
      "path" in item
        ? buildCommentLink(community, item)
        : buildPostLink(community, item),
    ),
    onClick: (e: React.MouseEvent<unknown>) => {
      if (!isTwoColumnLayout) return;

      e.preventDefault();

      const existingPath = router.getRouteInfo()?.pathname;

      if (!existingPath) throw new Error("No existing path");

      setPostDetail({
        id: "post_id" in item ? `${item.post_id}` : `${item.id}`,
        community: getHandle(community),
        commentPath: "path" in item ? item.path : undefined,
      });
    },
  };
}
