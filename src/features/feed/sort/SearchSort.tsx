import buildSort, { FlattenSortOptions } from "#/routes/pages/shared/Sort";

import { POST_SORT_BY_MODE } from "./PostSort";
import { PIEFED_TOP_SORTS } from "./topSorts";

export const SEARCH_SORT_BY_MODE = {
  lemmyv0: POST_SORT_BY_MODE["lemmyv0"],
  // v1's /search has no `sort` field — results are always ordered by New.
  lemmyv1: ["New"],
  piefed: ["Active", "Hot", PIEFED_TOP_SORTS, "New", "Scaled"],
} as const;

export type VgerSearchSortTypeByMode = {
  [K in keyof typeof SEARCH_SORT_BY_MODE]: FlattenSortOptions<
    (typeof SEARCH_SORT_BY_MODE)[K]
  >[number];
};

export type VgerSearchSortType =
  VgerSearchSortTypeByMode[keyof VgerSearchSortTypeByMode];

export const { Sort: SearchSort, useSelectSort: useSelectSearchSort } =
  buildSort(SEARCH_SORT_BY_MODE);
