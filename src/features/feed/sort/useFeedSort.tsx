import { CommentSortType, PostSortType } from "lemmy-js-client";
import { useCallback, useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "#/store";

import { AnyFeed } from "../helpers";
import {
  getFeedSort,
  getFeedSortSelectorBuilder,
  setFeedSort,
  SetSortActionPayload,
} from "./feedSortSlice";

interface Sorts {
  posts: PostSortType;
  comments: CommentSortType;
}

export default function useFeedSort<Context extends "posts" | "comments">(
  context: Context,
  feed?: AnyFeed | undefined,
  overrideSort?: Sorts[Context],
) {
  type Sort = Sorts[Context];

  const dispatch = useAppDispatch();

  const feedSort = useAppSelector(getFeedSortSelectorBuilder(feed, context)) as
    | Sort
    | null
    | undefined;
  const defaultSort = useAppSelector(
    (state) => state.settings.general[context].sort,
  ) as Sort;
  const rememberCommunitySort = useAppSelector(
    (state) => state.settings.general[context].rememberCommunitySort,
  );

  const [sort, _setSort] = useState<Sort | undefined>(
    !rememberCommunitySort
      ? (overrideSort ?? defaultSort)
      : (feedSort ?? overrideSort),
  );

  useEffect(() => {
    (async () => {
      if (!rememberCommunitySort) return;
      if (!feed) return;

      try {
        await dispatch(getFeedSort({ feed, context })).unwrap(); // unwrap to catch dispatched error (db failure)
      } catch (error) {
        _setSort((_sort) => _sort ?? defaultSort); // fallback if indexeddb unavailable
        throw error;
      }
    })();
  }, [feed, dispatch, rememberCommunitySort, context, defaultSort]);

  useEffect(() => {
    if (!rememberCommunitySort) return;
    if (sort) return;
    if (feedSort === undefined) return; // null = loaded, but custom community sort not found

    _setSort(feedSort ?? defaultSort);
  }, [feedSort, sort, defaultSort, rememberCommunitySort]);

  const setSort = useCallback(
    (sort: Sort) => {
      if (rememberCommunitySort && feed) {
        dispatch(
          setFeedSort({
            feed,
            sort,
            context,
          } as SetSortActionPayload),
        );
      }

      return _setSort(sort);
    },
    [context, dispatch, feed, rememberCommunitySort],
  );

  return [sort, setSort] as const;
}
