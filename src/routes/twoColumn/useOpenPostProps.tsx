import { PostView } from "lemmy-js-client";
import { use } from "react";

import { getHandle } from "#/helpers/lemmy";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import { useOptimizedIonRouter } from "#/helpers/useOptimizedIonRouter";

import { OutletContext } from "../Outlet";

export function useOpenPostProps(postView: PostView) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const { setPostDetail, isTwoColumnLayout } = use(OutletContext);
  const router = useOptimizedIonRouter();

  return {
    routerLink: buildGeneralBrowseLink(
      `/c/${getHandle(postView.community)}/comments/${postView.post.id}`,
    ),
    onClick: (e: React.MouseEvent<unknown>) => {
      if (!isTwoColumnLayout) return;

      e.preventDefault();

      const existingPath = router.getRouteInfo()?.pathname;

      if (!existingPath) throw new Error("No existing path");

      setPostDetail({
        id: `${postView.post.id}`,
        community: getHandle(postView.community),
      });
    },
  };
}
