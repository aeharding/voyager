import buildSort, { SortOptionsByMode } from "#/routes/pages/shared/Sort";

import { TOP_SORTS } from "./topSorts";

export type VgerSearchSortType =
  | "Old"
  | "New"
  | (typeof TOP_SORTS)["children"][number];

const sortOptionsByMode = {
  lemmyv0: ["Old", "New", TOP_SORTS],
  lemmyv1: ["Old", "New", TOP_SORTS],
  piefed: ["Old", "New", TOP_SORTS],
} as const satisfies SortOptionsByMode<VgerSearchSortType>;

export const { Sort: SearchSort, useSelectSort: useSelectSearchSort } =
  buildSort(sortOptionsByMode);
