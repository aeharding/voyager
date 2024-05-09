import { CommentSortType, SortType } from "lemmy-js-client";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import {
  FeedSortFeed,
  SetSortActionPayload,
  getFeedSort,
  getFeedSortSelectorBuilder,
  setFeedSort,
} from "./feedSortSlice";

export default function useSortByFeed<Context extends "posts" | "comments">(
  context: Context,
  feed?: FeedSortFeed | undefined,
) {
  type Sort = {
    posts: SortType;
    comments: CommentSortType;
  }[Context];

  const dispatch = useAppDispatch();
  const feedSort = useAppSelector(
    getFeedSortSelectorBuilder(feed, context),
  ) as Sort;
  const defaultSort = useAppSelector(
    (state) => state.settings.general[context].sort,
  ) as Sort;
  const rememberCommunitySort = useAppSelector(
    (state) => state.settings.general[context].rememberCommunitySort,
  );

  const [sort, _setSort] = useState<Sort | undefined>(
    !rememberCommunitySort ? defaultSort : undefined,
  );

  useEffect(() => {
    (async () => {
      if (!rememberCommunitySort) return;
      if (!feed) return;

      try {
        await dispatch(getFeedSort({ feed, context }));
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

  function setSort(sort: Sort) {
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
  }

  return [sort, setSort] as const;
}
