import { CommentSortType, PostSortType } from "lemmy-js-client";
import { useCallback, useEffect, useState } from "react";

import useSupported from "#/helpers/useSupported";
import { CommunitySortType } from "#/routes/pages/search/results/CommunitySort";
import { useAppDispatch, useAppSelector } from "#/store";

import { AnyFeed } from "../helpers";
import {
  getFeedSort,
  getFeedSortSelectorBuilder,
  setFeedSort,
  SetSortActionPayload,
} from "./feedSortSlice";
import { SearchSortType } from "./SearchSort";

interface Sorts {
  posts: PostSortType;
  comments: CommentSortType;
  search: SearchSortType;
  communities: CommunitySortType;
}

export default function useFeedSort<
  Context extends "posts" | "comments" | "search" | "communities",
>(context: Context, feed?: AnyFeed | undefined, overrideSort?: Sorts[Context]) {
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

export function useFeedSortParams<
  Context extends "posts" | "comments" | "search" | "communities",
>(
  context: Context,
  sort: Sorts[Context] | undefined,
  compatibleOldSortType?: "posts" | "comments",
): { sort: Sorts[Context]; time?: Time } | undefined {
  const isModern = useSupported("New Sorting");

  if (!sort) return;

  if (compatibleOldSortType && !isModern) {
    if (context !== "search")
      throw new Error("Can only convert search sort to old sort type");

    const actualSort = convertSearchSortToOldSortType(
      compatibleOldSortType,
      sort as SearchSortType,
    );

    return convertSortToLemmyParams(
      "search",
      actualSort as SearchSortType,
      isModern,
    );
  }

  return convertSortToLemmyParams(context, sort, isModern);
}

function convertSortToLemmyParams<
  Context extends "posts" | "comments" | "search" | "communities",
>(context: Context, sort: Sorts[Context], isModern: boolean) {
  if (!isModern) return { sort };

  switch (context) {
    case "posts":
      return convertPostSortToLemmyParams(sort as PostSortType);
    case "comments":
      return convertCommentSortToLemmyParams(sort as CommentSortType);
    case "search":
      return convertSearchSortToLemmyParams(sort as SearchSortType);
    case "communities":
      return convertCommunitySortToLemmyParams(sort as CommunitySortType);
  }
}

function convertSearchSortToOldSortType<
  OldContext extends "posts" | "comments",
>(oldSortType: OldContext, sort: SearchSortType): Sorts[OldContext] {
  switch (oldSortType) {
    case "posts":
      switch (sort) {
        case "New":
          return "New";
        case "Old":
          return "Old";
        case "Top":
          // @ts-expect-error TS bug?
          return "TopAll";
      }

      break;

    case "comments":
      switch (sort) {
        case "New":
          return "New";
        case "Old":
          return "Old";
        case "Top":
          // @ts-expect-error TS bug?
          return "Top";
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

function convertPostSortToLemmyParams(sort: PostSortType): {
  sort: LemmyPostSortType;
  time?: Time;
} {
  switch (sort) {
    case "Active":
    case "Hot":
    case "New":
    case "Old":
    case "MostComments":
    case "NewComments":
    case "Controversial":
    case "Scaled":
      return { sort };
    default:
      return convertTopToLemmyParams(sort);
  }
}

function convertCommentSortToLemmyParams(sort: CommentSortType): {
  sort: CommentSortType;
} {
  return { sort };
}

function convertSearchSortToLemmyParams(sort: SearchSortType): {
  sort: SearchSortType;
} {
  return { sort };
}

type TopTime =
  | "Day"
  | "Week"
  | "Month"
  | "Year"
  | "All"
  | "Hour"
  | "SixHour"
  | "TwelveHour"
  | "SixMonths"
  | "NineMonths"
  | "ThreeMonths";

function convertTopToLemmyParams(sort: `Top${TopTime}`): {
  sort: "Top";
  time?: Time;
} {
  if (sort === "TopAll") return { sort: "Top" };

  let time: Time;

  switch (sort) {
    case "TopDay":
      time = "day";
      break;
    case "TopWeek":
      time = "week";
      break;
    case "TopMonth":
      time = "month";
      break;
    case "TopYear":
      time = "year";
      break;
    case "TopHour":
      time = "hour";
      break;
    case "TopNineMonths":
      time = "nine_months";
      break;
    case "TopSixHour":
      time = "six_hours";
      break;
    case "TopSixMonths":
      time = "six_months";
      break;
    case "TopThreeMonths":
      time = "three_months";
      break;
    case "TopTwelveHour":
      time = "twelve_hours";
      break;
    default:
      throw new Error(`Invalid sort: ${sort}`);
  }

  return { sort: "Top", time };
}

function convertCommunitySortToLemmyParams(sort: CommunitySortType): {
  sort: CommunitySortType;
} {
  return { sort };
}
