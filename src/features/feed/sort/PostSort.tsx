import { arrayOfAll } from "#/helpers/array";
import buildSort, {
  flattenSortOptions,
  SortOptionsByMode,
} from "#/routes/pages/shared/Sort";

import { CONTROVERSIAL_SORTS } from "./controversialSorts";
import { TOP_SORTS } from "./topSorts";

export type VgerPostSortType =
  // Desired vanilla lemmy sort types
  | "Active"
  | "Hot"
  | "New"
  | "Scaled"
  | "MostComments"
  | "NewComments"
  // Plus voyager top sorts
  | (typeof TOP_SORTS)["children"][number]
  // Plus voyager controversial sorts
  | (typeof CONTROVERSIAL_SORTS)["children"][number];

export const POST_SORT_BY_MODE = {
  lemmyv0: [
    "Active",
    "Hot",
    TOP_SORTS,
    "New",
    "ControversialAll",
    "Scaled",
    "MostComments",
    "NewComments",
  ],
  lemmyv1: [
    "Active",
    "Hot",
    TOP_SORTS,
    "New",
    CONTROVERSIAL_SORTS,
    "Scaled",
    "MostComments",
    "NewComments",
  ],
  piefed: [
    "Hot",
    {
      label: "Top",
      children: [
        "TopHour",
        "TopSixHour",
        "TopTwelveHour",
        "TopDay",
        "TopWeek",
        "TopMonth",
      ],
    },
    "New",
    "Active",
    "Scaled",
  ],
} as const satisfies SortOptionsByMode<VgerPostSortType>;

// TODO: lemmy v1 might not contain all the sorts. Dedupe in typescript??
const flattenedSortOptions = flattenSortOptions(POST_SORT_BY_MODE.lemmyv1);

export const ALL_POST_SORTS =
  arrayOfAll<VgerPostSortType>()(flattenedSortOptions);

export const {
  Sort: PostSort,
  useSelectSort: useSelectPostSort,
  formatSort: formatPostSort,
} = buildSort(POST_SORT_BY_MODE);
