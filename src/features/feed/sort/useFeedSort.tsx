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

type SortTypeByContext = {
  posts: SortType;
  comments: CommentSortType;
};

export default function useSortByFeed<
  Context extends "posts" | "comments",
  Sort extends SortTypeByContext[Context],
>(context: Context, feed?: FeedSortFeed | undefined) {
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
    if (!rememberCommunitySort) return;
    if (!feed) return;

    dispatch(getFeedSort({ feed, context }));
  }, [feed, dispatch, rememberCommunitySort, context]);

  useEffect(() => {
    if (!rememberCommunitySort) return;
    if (sort) return;
    if (feedSort === undefined) return;

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
