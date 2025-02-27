import { PostSortType } from "lemmy-js-client";

import { arrayOfAll } from "#/helpers/array";
import buildSort, { SortOptions } from "#/routes/pages/shared/Sort";

const sortOptions: SortOptions<PostSortType> = [
  "Active",
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
      "TopThreeMonths",
      "TopSixMonths",
      "TopNineMonths",
      "TopYear",
      "TopAll",
    ],
  },
  "New",
  "Controversial",
  "Scaled",
  "MostComments",
  "NewComments",
];

export const ALL_POST_SORTS = arrayOfAll<PostSortType>()([
  "Active",
  "Hot",
  "New",
  "Old",
  "TopDay",
  "TopWeek",
  "TopMonth",
  "TopYear",
  "TopAll",
  "MostComments",
  "NewComments",
  "TopHour",
  "TopSixHour",
  "TopTwelveHour",
  "TopThreeMonths",
  "TopSixMonths",
  "TopNineMonths",
  "Controversial",
  "Scaled",
]);

export const {
  Sort: PostSort,
  useSelectSort: useSelectPostSort,
  formatSort: formatPostSort,
} = buildSort(sortOptions);
