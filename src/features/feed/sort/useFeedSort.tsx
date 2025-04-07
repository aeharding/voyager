import { CommentSortType, PostSortType } from "lemmy-js-client";
import { useCallback, useEffect, useState } from "react";

import { VgerCommentSortType } from "#/features/comment/CommentSort";
import useSupported from "#/helpers/useSupported";
import {
  LemmyCommunitySortType,
  VgerCommunitySortType,
} from "#/routes/pages/search/results/CommunitySort";
import { useAppDispatch, useAppSelector } from "#/store";

import { AnyFeed } from "../helpers";
import {
  getFeedSort,
  getFeedSortSelectorBuilder,
  setFeedSort,
  SetSortActionPayload,
} from "./feedSortSlice";
import { VgerPostSortType } from "./PostSort";
import { LemmySearchSortType, VgerSearchSortType } from "./SearchSort";
import { VgerTopSort } from "./topSorts";

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
  const isModern = useSupported("New Sorting");

  if (!sort) return;

  if (compatibleOldSortType && !isModern) {
    if (context !== "search")
      throw new Error("Can only convert search sort to old sort type");

    const actualSort = convertSearchSortToOldSortType(
      compatibleOldSortType,
      sort as VgerSearchSortType,
    );

    return convertSortToLemmyParams(
      "search",
      actualSort as VgerSearchSortType,
      isModern,
    );
  }

  return convertSortToLemmyParams(context, sort, isModern);
}

function convertSortToLemmyParams<
  Context extends "posts" | "comments" | "search" | "communities",
>(context: Context, sort: VgerSorts[Context], isModern: boolean) {
  if (!isModern) return { sort };

  switch (context) {
    case "posts":
      return convertPostSortToLemmyParams(sort as VgerPostSortType);
    case "comments":
      return convertCommentSortToLemmyParams(sort as VgerCommentSortType);
    case "search":
      return convertSearchSortToLemmyParams(sort as VgerSearchSortType);
    case "communities":
      return convertCommunitySortToLemmyParams(sort as VgerCommunitySortType);
  }
}

function convertSearchSortToOldSortType(
  oldSortType: "posts" | "comments",
  sort: VgerSearchSortType,
): LemmySorts["posts"] | LemmySorts["comments"] {
  switch (oldSortType) {
    case "posts":
      switch (sort) {
        case "New":
          return "New";
        case "Old":
          return "Old";
        case "TopAll":
          return "Top";
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
    case "Controversial":
    case "Scaled":
      return { sort };
    default:
      return convertTopToLemmyParams(sort);
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
    default:
      return convertTopToLemmyParams(sort);
  }
}

function convertTopToLemmyParams(sort: VgerTopSort): {
  sort: "Top";
  time_range_seconds?: number;
} {
  if (sort === "TopAll") return { sort: "Top" };

  // @ts-expect-error TODO lemmy v1 this should not be necessary anymore
  if (sort === "Top") return { sort: "Top" };

  let seconds: number; // in seconds

  switch (sort) {
    case "TopDay":
      seconds = 86400;
      break;
    case "TopWeek":
      seconds = 604800;
      break;
    case "TopMonth":
      seconds = 2592000;
      break;
    case "TopYear":
      seconds = 31536000;
      break;
    case "TopHour":
      seconds = 3600;
      break;
    case "TopNineMonths":
      seconds = 2147483647;
      break;
    case "TopSixHour":
      seconds = 21600;
      break;
    case "TopSixMonths":
      seconds = 15811200;
      break;
    case "TopThreeMonths":
      seconds = 7776000;
      break;
    case "TopTwelveHour":
      seconds = 43200;
      break;
    default:
      throw new Error(`Invalid sort: ${sort}`);
  }

  return { sort: "Top", time_range_seconds: seconds };
}

function convertCommunitySortToLemmyParams(sort: VgerCommunitySortType): {
  sort: VgerCommunitySortType;
} {
  return { sort };
}
