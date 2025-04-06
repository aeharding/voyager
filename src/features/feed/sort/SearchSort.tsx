import buildSort from "#/routes/pages/shared/Sort";
import { SortOptions } from "#/routes/pages/shared/Sort";

import { TOP_SORTS } from "./topSorts";

export type LemmySearchSortType = "Old" | "New" | "Top";

export type VgerSearchSortType =
  // TODO: Replace these with lemmy search sorts from v1
  | "Old"
  | "New"
  // Voyager top sorts
  | (typeof TOP_SORTS)["children"][number];

export const SEARCH_SORTS = [TOP_SORTS, "New", "Old"] as const;

const sortOptions: SortOptions<VgerSearchSortType> = SEARCH_SORTS;

export const { Sort: SearchSort, useSelectSort: useSelectSearchSort } =
  buildSort(sortOptions);
