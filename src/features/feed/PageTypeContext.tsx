import { createContext, useCallback, useContext } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { PostView } from "lemmy-js-client";
import { setPostHidden, setPostRead } from "../post/postSlice";

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

  const determineShouldAutohide = useCallback(
    (pageTypeOverride?: PageTypeContextValue) => {
      switch (pageTypeOverride ?? pageType) {
        case "community":
          return !disableAutoHideInCommunities;
        case "special-feed":
          return true; // setPostRead doesn't auto-hide if feature is turned completely off
        default:
          return false;
      }
    },
    [disableAutoHideInCommunities, pageType],
  );

  return useCallback(
    ({ post }: PostView, pageTypeOverride?: PageTypeContextValue) => {
      dispatch(setPostRead(post.id));

      const shouldAutohide = determineShouldAutohide(pageTypeOverride);

      // Determine if the post is pinned in the current feed
      const postIsPinned =
        (pageType === "community" && post.featured_community) ||
        (pageType === "special-feed" && post.featured_local);

      // Pinned posts should not be automatically hidden
      const shouldAutoHidePost = shouldAutohide && !postIsPinned;

      if (shouldAutoHidePost) dispatch(setPostHidden(post.id));
    },
    [determineShouldAutohide, dispatch, pageType],
  );
}
