import { arrayOfAll } from "#/helpers/array";
import buildSort, {
  flattenSortOptions,
  SortOptions,
} from "#/routes/pages/shared/Sort";

type LemmyPostSortType =
  | "Active"
  | "Hot"
  | "New"
  | "Controversial"
  | "Scaled"
  | "Top"
  | "MostComments"
  | "NewComments";

export type VgerPostSortType =
  // Desired vanilla lemmy sort types
  | Exclude<LemmyPostSortType, "Top" | "Old">
  // Plus voyager top sorts
  | (typeof TOP_SORTS)["children"][number];

import { TOP_SORTS } from "./topSorts";

const sortOptions = [
  "Active",
  "Hot",
  TOP_SORTS,
  "New",
  "Controversial",
  "Scaled",
  "MostComments",
  "NewComments",
] as const satisfies SortOptions<VgerPostSortType>;

const flattenedSortOptions = flattenSortOptions(sortOptions);

export const ALL_POST_SORTS =
  arrayOfAll<VgerPostSortType>()(flattenedSortOptions);

export const {
  Sort: PostSort,
  useSelectSort: useSelectPostSort,
  formatSort: formatPostSort,
} = buildSort(sortOptions);
