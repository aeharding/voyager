import { arrayOfAll } from "#/helpers/array";
import buildSort, {
  flattenSortOptions,
  SortOptions,
} from "#/routes/pages/shared/Sort";

import { CONTROVERSIAL_SORTS } from "./controversialSorts";
import { TOP_SORTS } from "./topSorts";

type LemmyPostSortType =
  | "Active"
  | "Hot"
  | "New"
  | "Scaled"
  | "Top"
  | "MostComments"
  | "NewComments";

export type VgerPostSortType =
  // Desired vanilla lemmy sort types
  | Exclude<LemmyPostSortType, "Top" | "Old">
  // Plus voyager top sorts
  | (typeof TOP_SORTS)["children"][number]
  // Plus voyager controversial sorts
  | (typeof CONTROVERSIAL_SORTS)["children"][number];

const sortOptions = [
  "Active",
  "Hot",
  TOP_SORTS,
  "New",
  CONTROVERSIAL_SORTS,
  "Scaled",
  "MostComments",
  "NewComments",
] as const satisfies SortOptions<VgerPostSortType>;

const legacySortOptions = [
  "Active",
  "Hot",
  TOP_SORTS,
  "New",
  "Controversial",
  "Scaled",
  "MostComments",
  "NewComments",
];

const flattenedSortOptions = flattenSortOptions(sortOptions);

export const ALL_POST_SORTS =
  arrayOfAll<VgerPostSortType>()(flattenedSortOptions);

export const {
  Sort: PostSort,
  useSelectSort: useSelectPostSort,
  formatSort: formatPostSort,
} = buildSort(sortOptions, legacySortOptions);
