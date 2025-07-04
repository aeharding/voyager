import buildSort, { FlattenSortOptions } from "#/routes/pages/shared/Sort";

import { CONTROVERSIAL_SORTS } from "./controversialSorts";
import { LEMMY_TOP_SORTS, PIEFED_TOP_SORTS } from "./topSorts";

export const POST_SORT_BY_MODE = {
  lemmyv0: [
    "Active",
    "Hot",
    LEMMY_TOP_SORTS,
    "New",
    "ControversialAll",
    "Scaled",
    "MostComments",
    "NewComments",
  ],
  lemmyv1: [
    "Active",
    "Hot",
    LEMMY_TOP_SORTS,
    "New",
    CONTROVERSIAL_SORTS,
    "Scaled",
    "MostComments",
    "NewComments",
  ],
  piefed: ["Hot", PIEFED_TOP_SORTS, "New", "Active", "Scaled"],
} as const;

export type VgerPostSortTypeByMode = {
  [K in keyof typeof POST_SORT_BY_MODE]: FlattenSortOptions<
    (typeof POST_SORT_BY_MODE)[K]
  >[number];
};

export type VgerPostSortType =
  VgerPostSortTypeByMode[keyof VgerPostSortTypeByMode];

export const {
  Sort: PostSort,
  useSelectSort: useSelectPostSort,
  formatSort: formatPostSort,
} = buildSort(POST_SORT_BY_MODE);
