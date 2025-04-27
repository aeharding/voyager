import { noop } from "es-toolkit";
import { createContext, use, useEffect, useState } from "react";

import { AnyFeed, serializeFeedName } from "#/features/feed/helpers";
import {
  OPostAppearanceType,
  PostAppearanceType,
  setPostAppearance as setGlobalPostAppearanceReducer,
} from "#/features/settings/settingsSlice";
import { OutletContext } from "#/routes/Outlet";
import { useAppDispatch, useAppSelector } from "#/store";

import {
  getPostAppearance,
  setPostAppeartance as setPostAppearanceReducer,
} from "./appearanceSlice";

interface PostAppearanceProviderProps extends React.PropsWithChildren {
  feed?: AnyFeed;
}

export default function PostAppearanceProvider({
  feed,
  children,
}: PostAppearanceProviderProps) {
  const dispatch = useAppDispatch();
  const globalPostAppearance = useAppSelector(
    (state) => state.settings.appearance.posts.type,
  );
  const rememberCommunityPostAppearance = useAppSelector(
    (state) => state.settings.appearance.posts.rememberType,
  );
  const feedPostAppearance = useAppSelector((state) =>
    feed
      ? state.postAppearance.postAppearanceByFeedName[serializeFeedName(feed)]
      : null,
  );

  const { isTwoColumnLayout } = use(OutletContext);
  const compactTwoColumn = useAppSelector(
    (state) => state.settings.appearance.layout.compactTwoColumn,
  );

  const forceCompact = isTwoColumnLayout && compactTwoColumn;

  const [postAppearance, _setPostAppearance] = useState(() => {
    if (forceCompact) return OPostAppearanceType.Compact;

    if (!rememberCommunityPostAppearance) return globalPostAppearance;

    return feedPostAppearance ?? globalPostAppearance;
  });

  useEffect(() => {
    (async () => {
      if (!rememberCommunityPostAppearance) return;
      if (!feed) return;
      if (forceCompact) return;

      try {
        await dispatch(getPostAppearance(feed)).unwrap(); // unwrap to catch dispatched error (db failure)
      } catch (error) {
        _setPostAppearance((_sort) => _sort ?? globalPostAppearance); // fallback if indexeddb unavailable
        throw error;
      }
    })();
  }, [
    feed,
    dispatch,
    rememberCommunityPostAppearance,
    globalPostAppearance,
    forceCompact,
  ]);

  useEffect(() => {
    if (!rememberCommunityPostAppearance) return;
    if (postAppearance) return;
    if (feedPostAppearance === undefined) return; // null = loaded, but custom community sort not found
    if (forceCompact) return;

    _setPostAppearance(feedPostAppearance ?? globalPostAppearance);
  }, [
    feedPostAppearance,
    postAppearance,
    globalPostAppearance,
    rememberCommunityPostAppearance,
    forceCompact,
  ]);

  function setPostAppearance(postAppearance: PostAppearanceType) {
    if (rememberCommunityPostAppearance) {
      if (feed) {
        dispatch(
          setPostAppearanceReducer({
            feed,
            postAppearance,
          }),
        );
      } // else - don't persist
    } else {
      dispatch(setGlobalPostAppearanceReducer(postAppearance));
    }

    return _setPostAppearance(postAppearance);
  }

  return (
    <PostAppearanceContext value={{ postAppearance, setPostAppearance }}>
      {children}
    </PostAppearanceContext>
  );
}

interface ContextValue {
  postAppearance: PostAppearanceType | undefined;
  setPostAppearance: (postAppearance: PostAppearanceType) => void;
}

const PostAppearanceContext = createContext<ContextValue>({
  postAppearance: undefined,
  setPostAppearance: noop,
});

export function usePostAppearance() {
  const { postAppearance } = use(PostAppearanceContext);
  const globalPostAppearance = useAppSelector(
    (state) => state.settings.appearance.posts.type,
  );
  const { isTwoColumnLayout } = use(OutletContext);
  const compactTwoColumn = useAppSelector(
    (state) => state.settings.appearance.layout.compactTwoColumn,
  );

  const forceCompact = isTwoColumnLayout && compactTwoColumn;

  if (forceCompact) return OPostAppearanceType.Compact;

  return postAppearance ?? globalPostAppearance;
}

export function useSetPostAppearance() {
  return use(PostAppearanceContext).setPostAppearance;
}

export function WaitUntilPostAppearanceResolved({
  children,
}: React.PropsWithChildren) {
  if (!use(PostAppearanceContext).postAppearance) return;

  return children;
}
