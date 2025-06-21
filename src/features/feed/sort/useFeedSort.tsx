import { useCallback, useEffect, useState } from "react";
import { CommentSortType, PostSortType } from "threadiverse";

import { VgerCommentSortType } from "#/features/comment/CommentSort";
import useSupported from "#/helpers/useSupported";
import {
  LemmyCommunitySortType,
  VgerCommunitySortType,
} from "#/routes/pages/search/results/CommunitySort";
import { useAppDispatch, useAppSelector } from "#/store";

import { AnyFeed } from "../helpers";
import {
  controversialSortToDuration,
  isControversialSort,
  VgerControversialSort,
} from "./controversialSorts";
import { convertDurationToSeconds } from "./durations";
import {
  getFeedSort,
  getFeedSortSelectorBuilder,
  setFeedSort,
  SetSortActionPayload,
} from "./feedSortSlice";
import { POST_SORT_SUPPORT, VgerPostSortType } from "./PostSort";
import { LemmySearchSortType, VgerSearchSortType } from "./SearchSort";
import { isTopSort, topSortToDuration, VgerTopSort } from "./topSorts";

interface VgerSorts {
  posts: VgerPostSortType;
  comments: VgerCommentSortType;
  search: VgerSearchSortType;
  communities: VgerCommunitySortType;
}

interface LemmySorts {
  posts: PostSortType;
  comments: CommentSortType;
  search: LemmySearchSortType;
  communities: LemmyCommunitySortType;
}

export default function useFeedSort<
  Context extends "posts" | "comments" | "search" | "communities",
>(
  context: Context,
  feed?: AnyFeed | undefined,
  overrideSort?: VgerSorts[Context],
) {
  type Sort = VgerSorts[Context];

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

// TODO: After lemmy v1 is released, we can remove this CompatContext
export function useFeedSortParams<CompatContext extends "posts" | "comments">(
  context: "search",
  sort: VgerSorts["search"] | undefined,
  compatibleOldSortType?: CompatContext,
): { sort: LemmySorts[CompatContext]; time?: Time } | undefined;
export function useFeedSortParams<CompatContext extends "posts">(
  context: "communities",
  sort: VgerSorts["communities"] | undefined,
  compatibleOldSortType?: CompatContext,
): { sort: LemmySorts[CompatContext]; time?: Time } | undefined;
export function useFeedSortParams<
  Context extends "posts" | "comments" | "communities",
>(
  context: Context,
  sort: VgerSorts[Context] | undefined,
): { sort: LemmySorts[Context]; time?: Time } | undefined;
export function useFeedSortParams<
  Context extends "posts" | "comments" | "search" | "communities",
>(
  context: Context,
  sort: VgerSorts[Context] | undefined,
  compatibleOldSortType?: "posts" | "comments",
) {
  const mode = useMode();

  if (!sort) return;

  return convertSortToLemmyParams(context, sort, mode);
}

function convertSortToLemmyParams<
  Context extends "posts" | "comments" | "search" | "communities",
>(
  context: Context,
  sort: VgerSorts[Context],
  mode: "lemmyv0" | "lemmyv1" | "piefed",
) {
  switch (context) {
    case "posts":
      return POST_SORT_SUPPORT[sort].find((p) => p.mode === mode);
    case "comments":
      return COMMENT_SORT_SUPPORT[sort].find((p) => p.mode === mode);
    case "search":
      return SEARCH_SORT_SUPPORT[sort].find((p) => p.mode === mode);
    case "communities":
      return COMMUNITY_SORT_SUPPORT[sort].find((p) => p.mode === mode);
  }
}

function convertSearchSortToOldSortType(
  oldSortType: "posts" | "comments",
  sort: VgerSearchSortType,
  mode: "lemmyv0" | "lemmyv1" | "piefed",
): LemmySorts["posts"] | LemmySorts["comments"] {
  switch (oldSortType) {
    case "posts":
      switch (sort) {
        case "New":
          return "New";
        case "Old":
          return "Old";
        case "TopAll":
          return "TopAll";
        case "TopDay":
          return "TopDay";
        case "TopWeek":
          return "TopWeek";
        case "TopMonth":
          return "TopMonth";
        case "TopYear":
          return "TopYear";
        case "TopHour":
          return "TopHour";
        case "TopSixHour":
          return "TopSixHour";
        case "TopNineMonths":
          return "TopNineMonths";
        case "TopSixMonths":
          return "TopSixMonths";
        case "TopThreeMonths":
          return "TopThreeMonths";
        case "TopTwelveHour":
          return "TopTwelveHour";
      }

      break;

    case "comments":
      switch (sort) {
        case "New":
          return "New";
        case "Old":
          return "Old";
      }
  }
  throw new Error(`Invalid sort: ${sort}`);
}

function convertCommunitySortToOldSortType(
  oldSortType: "posts",
  sort: VgerCommunitySortType,
): LemmySorts["posts"] | LemmySorts["comments"] {
  switch (oldSortType) {
    case "posts":
      switch (sort) {
        case "New":
          return "New";
        case "Old":
          return "Old";
        case "ActiveDaily":
          return "TopDay";
        case "ActiveMonthly":
          return "TopMonth";
        case "ActiveSixMonths":
          return "TopSixMonths";
        case "ActiveWeekly":
          return "TopWeek";
        case "Comments":
          return "MostComments";
        case "Hot":
          return "Hot";
        case "NameAsc":
        case "NameDesc":
        case "Subscribers":
        case "SubscribersLocal":
        case "Posts":
          return "TopAll";
      }
  }
  throw new Error(`Invalid sort: ${sort}`);
}

type Time =
  | "day"
  | "week"
  | "month"
  | "year"
  | "all"
  | "hour"
  | "six_hours"
  | "twelve_hours"
  | "six_months"
  | "nine_months"
  | "three_months";

type LemmyPostSortType =
  | "Active"
  | "Hot"
  | "New"
  | "Old"
  | "MostComments"
  | "NewComments"
  | "Controversial"
  | "Scaled"
  | "Top";

function convertPostSortToLemmyParams(sort: VgerPostSortType): {
  sort: LemmyPostSortType;
  time?: Time;
} {
  switch (sort) {
    case "Active":
    case "Hot":
    case "New":
    case "MostComments":
    case "NewComments":
    case "Scaled":
      return { sort };
    default:
      if (isTopSort(sort)) {
        return convertTopToLemmyParams(sort);
      }

      if (isControversialSort(sort)) {
        return convertControversialToLemmyParams(sort);
      }

      throw new Error(`Invalid sort: ${sort}`);
  }
}

function convertCommentSortToLemmyParams(sort: VgerCommentSortType): {
  sort: CommentSortType;
} {
  return { sort };
}

function convertSearchSortToLemmyParams(sort: VgerSearchSortType): {
  // TODO: Replace this with lemmy search sort types from v1
  sort: LemmySearchSortType;
  time_range_seconds?: number;
} {
  switch (sort) {
    case "New":
    case "Old":
      return { sort };
    default: {
      return convertTopToLemmyParams(sort);
    }
  }
}

function convertTopToLemmyParams(sort: VgerTopSort): {
  sort: "Top";
  time_range_seconds?: number;
} {
  // @ts-expect-error TODO lemmy v1 this should not be necessary anymore
  if (sort === "Top") return { sort: "Top" };

  return {
    sort: "Top",
    time_range_seconds: convertDurationToSeconds(topSortToDuration(sort)),
  };
}

function convertCommunitySortToLemmyParams(sort: VgerCommunitySortType): {
  sort: VgerCommunitySortType;
} {
  return { sort };
}

function convertControversialToLemmyParams(sort: VgerControversialSort): {
  sort: "Controversial";
  time_range_seconds?: number;
} {
  return {
    sort: "Controversial",
    time_range_seconds: convertDurationToSeconds(
      controversialSortToDuration(sort),
    ),
  };
}
