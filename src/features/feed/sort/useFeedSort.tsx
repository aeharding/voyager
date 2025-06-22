import { useCallback, useEffect, useState } from "react";
import {
  CommentSortTypeByMode,
  PostSortTypeByMode,
  ThreadiverseMode,
} from "threadiverse";

import useMode from "#/core/useMode";
import {
  COMMENT_SORT_BY_MODE,
  VgerCommentSortType,
} from "#/features/comment/CommentSort";
import { VgerCommunitySortType } from "#/routes/pages/search/results/CommunitySort";
import { FlattenSortOptions } from "#/routes/pages/shared/Sort";
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
import { POST_SORT_BY_MODE, VgerPostSortType } from "./PostSort";
import { VgerSearchSortType } from "./SearchSort";
import { isTopSort, topSortToDuration, VgerTopSort } from "./topSorts";

interface VgerSorts {
  posts: VgerPostSortType;
  comments: VgerCommentSortType;
  search: VgerSearchSortType;
  communities: VgerCommunitySortType;
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

export function useFeedSortParams<
  Context extends "posts" | "comments" | "search" | "communities",
>(context: Context, sort: VgerSorts[Context] | undefined) {
  const mode = useMode();

  if (!sort || !mode) return;

  return convertSortToLemmyParams(context, sort, mode);
}

function convertSortToLemmyParams<
  Context extends "posts" | "comments" | "search" | "communities",
>(context: Context, sort: VgerSorts[Context], mode: ThreadiverseMode) {
  switch (context) {
    case "posts":
      return convertPostSortToParams(sort as VgerPostSortType, mode);
    case "comments":
      return convertCommentSortToParams(sort as VgerCommentSortType, mode);
    // case "search":
    //   return SEARCH_SORT_SUPPORT[sort].find((p) => p.mode === mode);
    // case "communities":
    //   return COMMUNITY_SORT_SUPPORT[sort].find((p) => p.mode === mode);
  }
}

type PiefedCommentSorts = FlattenSortOptions<
  (typeof COMMENT_SORT_BY_MODE)["piefed"]
>[number];

function convertCommentSortToParams(
  sort: VgerCommentSortType,
  mode: ThreadiverseMode,
): CommentSortTypeByMode[ThreadiverseMode] {
  switch (mode) {
    case "lemmyv0":
      return { sort, mode: "lemmyv0" };
    case "lemmyv1":
      return { sort, mode: "lemmyv1" };
    case "piefed":
      return { sort: sort as PiefedCommentSorts, mode: "piefed" };
  }
}

function convertPostSortToParams(
  sort: VgerPostSortType,
  mode: ThreadiverseMode,
): PostSortTypeByMode[ThreadiverseMode] {
  switch (mode) {
    case "lemmyv0":
      return convertPostSortToLemmyV0Params(sort as LemmyV0PostSorts);
    case "lemmyv1":
      return convertPostSortToLemmyV1Params(sort);
    case "piefed": {
      return convertPostSortToPiefedParams(sort as PiefedPostSorts);
    }
  }
}

type LemmyV0PostSorts = FlattenSortOptions<
  (typeof POST_SORT_BY_MODE)["lemmyv0"]
>[number];

function convertPostSortToLemmyV0Params(
  sort: LemmyV0PostSorts,
): PostSortTypeByMode["lemmyv0"] {
  switch (sort) {
    case "Active":
    case "Hot":
    case "New":
    case "MostComments":
    case "NewComments":
    case "Scaled":
    case "TopAll":
    case "TopDay":
    case "TopWeek":
    case "TopMonth":
    case "TopYear":
    case "TopHour":
    case "TopSixHour":
    case "TopTwelveHour":
    case "TopThreeMonths":
    case "TopSixMonths":
    case "TopNineMonths":
      return { sort, mode: "lemmyv0" };
    case "ControversialAll":
      return { sort: "Controversial", mode: "lemmyv0" };
  }
}

function convertPostSortToLemmyV1Params(
  sort: FlattenSortOptions<(typeof POST_SORT_BY_MODE)["lemmyv1"]>[number],
): PostSortTypeByMode["lemmyv1"] {
  switch (sort) {
    case "Active":
    case "Hot":
    case "New":
    case "MostComments":
    case "NewComments":
    case "Scaled":
      return { sort, mode: "lemmyv1" };
    default:
      if (isTopSort(sort)) {
        return {
          ...convertTopToLemmyParams(sort),
          mode: "lemmyv1",
        };
      }

      if (isControversialSort(sort)) {
        return {
          ...convertControversialToLemmyParams(sort),
          mode: "lemmyv1",
        };
      }

      throw new Error(`Invalid sort: ${sort}`);
  }
}

type PiefedPostSorts = FlattenSortOptions<
  (typeof POST_SORT_BY_MODE)["piefed"]
>[number];

function convertPostSortToPiefedParams(
  sort: PiefedPostSorts,
): PostSortTypeByMode["piefed"] {
  switch (sort) {
    case "Active":
    case "Hot":
    case "New":
    case "Scaled":
    case "TopHour":
    case "TopSixHour":
    case "TopTwelveHour":
    case "TopDay":
    case "TopWeek":
    case "TopMonth":
      return { sort, mode: "piefed" };
  }
}

function convertTopToLemmyParams(sort: VgerTopSort): {
  sort: "Top";
  time_range_seconds?: number;
} {
  return {
    sort: "Top",
    time_range_seconds: convertDurationToSeconds(topSortToDuration(sort)),
  };
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
