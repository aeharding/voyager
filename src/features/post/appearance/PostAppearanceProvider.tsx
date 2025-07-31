import { noop } from "es-toolkit";
import {
  createContext,
  use,
  useEffect,
  experimental_useEffectEvent as useEffectEvent,
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

  const initAsyncPostAppearance = useEffectEvent(
    async (signal: AbortSignal) => {
      function onAsyncPostAppearance(
        feedPostAppearance: PostAppearanceType | null,
      ) {
        if (postAppearance) return; // if already set, don't update

        if (!rememberCommunityPostAppearance) return;
        if (feedPostAppearance === undefined) return; // null = loaded, but custom community sort not found

        _setPostAppearance(feedPostAppearance ?? defaultPostAppearance);
      }

      if (!rememberCommunityPostAppearance) return;
      if (!feed) return;

      let feedPostAppearance: PostAppearanceType | null;

      try {
        ({ postAppearance: feedPostAppearance } = await dispatch(
          getPostAppearance(feed),
        ).unwrap()); // unwrap to catch dispatched error (db failure)
      } catch (error) {
        if (signal.aborted) return;

        _setPostAppearance((_sort) => _sort ?? defaultPostAppearance); // fallback if indexeddb unavailable
        throw error;
      }

      if (signal.aborted) return;

      onAsyncPostAppearance(feedPostAppearance);
    },
  );

  useEffect(() => {
    const abortController = new AbortController();

    initAsyncPostAppearance(abortController.signal);

    return () => abortController.abort();
  }, []);

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
  const defaultPostAppearance = useAppSelector(
    (state) => state.settings.appearance.posts.type,
  );

  return postAppearance ?? defaultPostAppearance;
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
