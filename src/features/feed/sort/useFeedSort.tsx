import { SortType } from "lemmy-js-client";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import {
  FeedSortFeed,
  getFeedSort,
  getFeedSortSelectorBuilder,
  setFeedSort,
} from "./feedSortSlice";

export default function useFeedSort(feed?: FeedSortFeed | undefined) {
  const dispatch = useAppDispatch();
  const feedSort = useAppSelector(getFeedSortSelectorBuilder(feed));
  const defaultSort = useAppSelector(
    (state) => state.settings.general.posts.sort,
  );
  const rememberCommunitySort = useAppSelector(
    (state) => state.settings.general.posts.rememberCommunitySort,
  );

  const [sort, _setSort] = useState<SortType | undefined>(
    !rememberCommunitySort ? defaultSort : undefined,
  );

  useEffect(() => {
    if (!rememberCommunitySort) return;
    if (!feed) return;

    dispatch(getFeedSort(feed));
  }, [feed, dispatch, rememberCommunitySort]);

  useEffect(() => {
    if (!rememberCommunitySort) return;
    if (sort) return;
    if (feedSort === undefined) return;

    _setSort(feedSort ?? defaultSort);
  }, [feedSort, sort, defaultSort, rememberCommunitySort]);

  function setSort(sort: SortType) {
    if (rememberCommunitySort && feed) {
      dispatch(
        setFeedSort({
          feed,
          sort,
        }),
      );
    }

    return _setSort(sort);
  }

  return [sort, setSort] as const;
}
