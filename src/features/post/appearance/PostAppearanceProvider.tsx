import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { AnyFeed, serializeFeedName } from "#/features/feed/helpers";
import {
  PostAppearanceType,
  setPostAppearance as setGlobalPostAppearanceReducer,
} from "#/features/settings/settingsSlice";
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
  const defaultPostAppearance = useAppSelector(
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
  const [postAppearance, _setPostAppearance] = useState(
    !rememberCommunityPostAppearance
      ? defaultPostAppearance
      : (feedPostAppearance ?? undefined),
  );

  useEffect(() => {
    (async () => {
      if (!rememberCommunityPostAppearance) return;
      if (!feed) return;

      try {
        await dispatch(getPostAppearance(feed)).unwrap(); // unwrap to catch dispatched error (db failure)
      } catch (error) {
        _setPostAppearance((_sort) => _sort ?? defaultPostAppearance); // fallback if indexeddb unavailable
        throw error;
      }
    })();
  }, [feed, dispatch, rememberCommunityPostAppearance, defaultPostAppearance]);

  useEffect(() => {
    if (!rememberCommunityPostAppearance) return;
    if (postAppearance) return;
    if (feedPostAppearance === undefined) return; // null = loaded, but custom community sort not found

    _setPostAppearance(feedPostAppearance ?? defaultPostAppearance);
  }, [
    feedPostAppearance,
    postAppearance,
    defaultPostAppearance,
    rememberCommunityPostAppearance,
  ]);

  const setPostAppearance = useCallback(
    (postAppearance: PostAppearanceType) => {
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
    },
    [dispatch, feed, rememberCommunityPostAppearance],
  );

  const value = useMemo(
    () => ({ postAppearance, setPostAppearance }),
    [postAppearance, setPostAppearance],
  );

  return (
    <PostAppearanceContext.Provider value={value}>
      {children}
    </PostAppearanceContext.Provider>
  );
}

interface ContextValue {
  postAppearance: PostAppearanceType | undefined;
  setPostAppearance: (postAppearance: PostAppearanceType) => void;
}

const PostAppearanceContext = createContext<ContextValue>({
  postAppearance: undefined,
  setPostAppearance: () => {},
});

export function usePostAppearance() {
  const { postAppearance } = useContext(PostAppearanceContext);
  const defaultPostAppearance = useAppSelector(
    (state) => state.settings.appearance.posts.type,
  );

  return postAppearance ?? defaultPostAppearance;
}

export function useSetPostAppearance() {
  return useContext(PostAppearanceContext).setPostAppearance;
}

export function WaitUntilPostAppearanceResolved({
  children,
}: React.PropsWithChildren) {
  if (!useContext(PostAppearanceContext).postAppearance) return;

  return children;
}
