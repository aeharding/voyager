import { useCallback, useEffect, useState } from "react";
import {
  CommentSortType,
  CommunitySortTypeByMode,
  PostSortType,
  PostSortTypeByMode,
  SearchSortTypeByMode,
  ThreadiverseMode,
} from "threadiverse";

import {
  VgerCommentSortType,
  VgerCommentSortTypeByMode,
} from "#/features/comment/CommentSort";
import { useMode } from "#/helpers/threadiverse";
import {
  VgerCommunitySortType,
  VgerCommunitySortTypeByMode,
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
import { VgerPostSortType, VgerPostSortTypeByMode } from "./PostSort";
import { VgerSearchSortType, VgerSearchSortTypeByMode } from "./SearchSort";
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
  const mode = useMode();

  const feedSort = useAppSelector(getFeedSortSelectorBuilder(feed, context)) as
    | Sort
    | null
    | undefined;
  const defaultSort = useAppSelector((state) =>
    mode ? state.settings.general[context].sort[mode] : undefined,
  ) as Sort | undefined;
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
    if (sort) return;
    if (!rememberCommunitySort) {
      // If default sort not loaded yet, update to use it
      _setSort(defaultSort);
      return;
    }
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
      return convertPostSortToParams(sort as VgerSorts["posts"], mode);
    case "comments":
      return convertCommentSortToParams(sort as VgerSorts["comments"], mode);
    case "search":
      return convertSearchSortToParams(sort as VgerSearchSortType, mode);
    case "communities":
      return convertCommunitySortToParams(sort as VgerCommunitySortType, mode);
  }
}

function convertCommunitySortToParams(
  sort: VgerCommunitySortType,
  mode: ThreadiverseMode,
): CommunitySortTypeByMode[ThreadiverseMode] {
  switch (mode) {
    case "lemmyv0":
      return convertPostSortToLemmyV0Params(
        sort as VgerCommunitySortTypeByMode["lemmyv0"],
      );
    case "lemmyv1":
      return {
        sort: sort as VgerCommunitySortTypeByMode["lemmyv1"],
        mode: "lemmyv1",
      };
    case "piefed":
      return convertPostSortToPiefedParams(
        sort as VgerCommunitySortTypeByMode["piefed"],
      );
  }
}

function convertSearchSortToParams(
  sort: VgerSearchSortType,
  mode: ThreadiverseMode,
): SearchSortTypeByMode[ThreadiverseMode] {
  switch (mode) {
    case "lemmyv0":
      return convertPostSortToLemmyV0Params(
        sort as VgerPostSortTypeByMode["lemmyv0"],
      );
    case "lemmyv1":
      return convertSearchSortToLemmyV1Params(
        sort as VgerSearchSortTypeByMode["lemmyv1"],
      );
    case "piefed":
      return convertSearchSortToPiefedParams(
        sort as VgerSearchSortTypeByMode["piefed"],
      );
  }
}

function convertSearchSortToLemmyV1Params(
  sort: VgerSearchSortTypeByMode["lemmyv1"],
): SearchSortTypeByMode["lemmyv1"] {
  switch (sort) {
    case "Old":
    case "New":
      return { sort, mode: "lemmyv1" };
    default:
      if (isTopSort(sort)) {
        return {
          ...convertTopToLemmyParams(sort),
          mode: "lemmyv1",
        };
      }

      throw new Error(`Invalid sort: ${sort}`);
  }
}

function convertSearchSortToPiefedParams(
  sort: VgerSearchSortTypeByMode["piefed"],
): SearchSortTypeByMode["piefed"] {
  switch (sort) {
    case "New":
    case "TopDay":
    case "TopHour":
    case "TopMonth":
    case "TopSixHour":
    case "TopTwelveHour":
    case "TopWeek":
    case "Active":
    case "Hot":
    case "Scaled":
      return { sort, mode: "piefed" };
  }
}

function convertCommentSortToParams(
  sort: VgerCommentSortType,
  mode: ThreadiverseMode,
): CommentSortType {
  switch (mode) {
    case "lemmyv0":
      return { sort, mode: "lemmyv0" };
    case "lemmyv1":
      return { sort, mode: "lemmyv1" };
    case "piefed":
      return {
        sort: sort as VgerCommentSortTypeByMode["piefed"],
        mode: "piefed",
      };
  }
}

function convertPostSortToParams(
  sort: VgerPostSortType,
  mode: ThreadiverseMode,
): PostSortType {
  switch (mode) {
    case "lemmyv0":
      return convertPostSortToLemmyV0Params(
        sort as VgerPostSortTypeByMode["lemmyv0"],
      );
    case "lemmyv1":
      return convertPostSortToLemmyV1Params(sort);
    case "piefed": {
      return convertPostSortToPiefedParams(
        sort as VgerPostSortTypeByMode["piefed"],
      );
    }
  }
}

function convertPostSortToLemmyV0Params(
  sort: VgerPostSortTypeByMode["lemmyv0"],
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
  sort: VgerPostSortTypeByMode["lemmyv1"],
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

function convertPostSortToPiefedParams(
  sort: VgerPostSortTypeByMode["piefed"],
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
