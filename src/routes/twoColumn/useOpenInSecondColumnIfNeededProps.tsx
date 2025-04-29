import { Comment, Community, Post } from "lemmy-js-client";
import { use } from "react";

import { buildCommentLink, buildPostLink } from "#/helpers/appLinkBuilder";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import { useOptimizedIonRouter } from "#/helpers/useOptimizedIonRouter";

import { OutletContext } from "../OutletProvider";
import useActivatedClass from "./useActivatedClass";

export function useOpenInSecondColumnIfNeededProps(routerLink: string) {
  const { setSecondColumnLocation, isTwoColumnLayout } = use(OutletContext);
  const router = useOptimizedIonRouter();

  return {
    routerLink,
    className: useActivatedClass(routerLink),
    onClick: (e: React.MouseEvent<unknown>) => {
      if (!isTwoColumnLayout) return;

      e.preventDefault();

      const existingPath = router.getRouteInfo()?.pathname;

      if (!existingPath) throw new Error("No existing path");

      setSecondColumnLocation(routerLink);
    },
  };
}

export function useOpenCommentInSecondColumnIfNeededProps(
  comment: Comment,
  community: Community,
) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  return useOpenInSecondColumnIfNeededProps(
    buildGeneralBrowseLink(buildCommentLink(community, comment)),
  );
}

export function useOpenPostInSecondColumnIfNeededProps(
  post: Post,
  community: Community,
) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  return useOpenInSecondColumnIfNeededProps(
    buildGeneralBrowseLink(buildPostLink(community, post)),
  );
}
