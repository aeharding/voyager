import { PostView } from "lemmy-js-client";
import { createContext, useContext } from "react";

import { setPostHidden } from "#/features/post/postSlice";
import { useAppDispatch, useAppSelector } from "#/store";

export type PageTypeContextValue = "community" | "special-feed" | undefined;

export const PageTypeContext = createContext<PageTypeContextValue>(undefined);

/**
 * The whole reason for this hook is determining if autohiding should be enabled
 * depends on where the post is. If within a community, for example,
 * different things happen if disable in communities setting is on
 */
export function useAutohidePostIfNeeded() {
  const dispatch = useAppDispatch();
  const pageType = useContext(PageTypeContext);
  const disableAutoHideInCommunities = useAppSelector(
    (state) => state.settings.general.posts.disableAutoHideInCommunities,
  );

  return function ({ post }: PostView, trigger: "scroll" | "tap" = "tap") {
    const shouldAutohide = (() => {
      switch (pageType) {
        case "community":
          return !disableAutoHideInCommunities;
        case "special-feed":
          return true; // setPostRead doesn't auto-hide if feature is turned completely off
        default:
          return false;
      }
    })();

    if (!shouldAutohide) return;

    // Determine if the post is pinned in the current feed
    const postIsPinned =
      (pageType === "community" && post.featured_community) ||
      (pageType === "special-feed" && post.featured_local);

    // Pinned posts should not be automatically hidden on scroll auto hide,
    // but should when explicitly tapped
    if (postIsPinned && trigger === "scroll") return;

    dispatch(setPostHidden(post.id));
  };
}
