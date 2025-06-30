import { useCallback, useEffect, useState } from "react";
import {
  CommentSortType,
  CommunitySortType,
  CommunitySortTypeByMode,
  PostSortType,
  PostSortTypeByMode,
  SearchSortType,
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
import { AnyVgerSort } from "#/routes/pages/shared/Sort";
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

interface VgerSortsByContext {
  posts: VgerPostSortType;
  comments: VgerCommentSortType;
  search: VgerSearchSortType;
  communities: VgerCommunitySortType;
}

interface VgerSortsByContextByMode {
  posts: VgerPostSortTypeByMode;
  comments: VgerCommentSortTypeByMode;
  search: VgerSearchSortTypeByMode;
  communities: VgerCommunitySortTypeByMode;
}

interface Sorts {
  posts: PostSortType;
  comments: CommentSortType;
  search: SearchSortType;
  communities: CommunitySortType;
}

export type FeedSortContext = "posts" | "comments" | "search" | "communities";

export default function useFeedSort<Context extends FeedSortContext>(
  context: Context,
  feed?: AnyFeed | undefined,
  overrideSort?:
    | VgerSortsByContextByMode[Context]
    | VgerSortsByContext[Context],
) {
  type Sort = VgerSortsByContext[Context];

  const dispatch = useAppDispatch();
  const mode = useMode();

  const feedSort = useAppSelector(getFeedSortSelectorBuilder(feed, context)) as
    | Sort
    | null
    | undefined;
  const defaultSort = useAppSelector((state) =>
    mode ? state.settings.general[context].sort[mode] : mode,
  ) as Sort | undefined;
  const rememberCommunitySort = useAppSelector(
    (state) =>
      state.settings.general[findFeedContext(feed) ?? context]
        .rememberCommunitySort,
  );

  const getOverrideSort = useCallback(
    (mode: ThreadiverseMode): Sort | null | undefined => {
      if (!overrideSort) return null;
      if (typeof overrideSort === "string") return overrideSort;
      return overrideSort[mode] as Sort;
    },
    [overrideSort],
  );

  const onSortUpdate = useCallback(
    (dbFailure = false) => {
      if (!mode) return mode;

      // If there is an active remember feed sort (or it's loading), return it
      if (rememberCommunitySort && feedSort !== null && !dbFailure)
        return feedSort;

      const override = getOverrideSort(mode);

      // If there is no override/it's not loading either, return default sort
      if (override !== null) return override;

      return defaultSort;
    },
    [feedSort, rememberCommunitySort, defaultSort, mode, getOverrideSort],
  );

  const [sort, _setSort] = useState<Sort | null | undefined>(onSortUpdate);

  useEffect(() => {
    if (sort) return; // Latch an existing sort
    if (!rememberCommunitySort) return;
    if (!feed) return;

    (async () => {
      try {
        await dispatch(getFeedSort({ feed, context })).unwrap(); // unwrap to catch dispatched error (db failure)
      } catch (error) {
        _setSort((_sort) => _sort ?? onSortUpdate(true)); // fallback if indexeddb unavailable
        throw error;
      }
    })();
  }, [feed, dispatch, rememberCommunitySort, context, onSortUpdate, sort]);

  useEffect(() => {
    _setSort((_sort) => _sort ?? onSortUpdate());
  }, [onSortUpdate]);

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

function findFeedContext(
  feed: AnyFeed | undefined,
): FeedSortContext | undefined {
  if (!feed) return;
  if (!("internal" in feed)) return;

  switch (feed.internal) {
    case "CommentsSearch":
      return "comments";
    case "PostsSearch":
      return "posts";
    case "CommunitiesSearch":
      return "communities";
    case "CommunitiesExplore":
      return "communities";
    case "ProfilePosts":
      return "posts";
    case "ProfileComments":
      return "comments";
  }
}

/**
 * @param context What kind of feed is this?
 * @param sort The Voyager sort to convert to threadiverse sort params
 * @returns The sort, null if loaded but no result. Null if still loading async.
 */
export function useFeedSortParams<Context extends FeedSortContext>(
  context: Context,
  sort: VgerSortsByContext[Context] | null | undefined,
): Sorts[Context] | null | undefined {
  const mode = useMode();

  if (!mode) return mode;
  if (!sort) return null; // loaded, but not found

  return convertSortToLemmyParams(context, sort, mode) ?? null;
}

function convertSortToLemmyParams<Context extends FeedSortContext>(
  context: Context,
  sort: VgerSortsByContext[Context],
  mode: ThreadiverseMode,
): Sorts[Context] | undefined {
  switch (context) {
    case "posts":
      return convertPostSortToParams(
        sort as VgerSortsByContext["posts"],
        mode,
      ) as Sorts[typeof context];
    case "comments":
      return convertCommentSortToParams(
        sort as VgerSortsByContext["comments"],
        mode,
      ) as Sorts[typeof context];
    case "search":
      return convertSearchSortToParams(
        sort as VgerSortsByContext["search"],
        mode,
      ) as Sorts[typeof context];
    case "communities":
      return convertCommunitySortToParams(
        sort as VgerSortsByContext["communities"],
        mode,
      ) as Sorts[typeof context];
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
      return {
        sort: sort as VgerCommunitySortTypeByMode["piefed"],
        mode: "piefed",
      };
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

export function isTimeBoundedSort(sort: AnyVgerSort) {
  if (isControversialSort(sort)) {
    return (
      convertDurationToSeconds(controversialSortToDuration(sort)) !== undefined
    );
  }

  if (isTopSort(sort)) {
    return convertDurationToSeconds(topSortToDuration(sort)) !== undefined;
  }
}
