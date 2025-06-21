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

export const POST_SORT_SUPPORT = {
  Active: [
    {
      mode: "lemmyv1",
      sort: "Active",
    },
    {
      mode: "lemmyv0",
      sort: "Active",
    },
    {
      mode: "piefed",
      sort: "Active",
    },
  ],
  Hot: [],
  ...Object.fromEntries(
    TOP_SORTS.children.map((sort) => [
      sort,
      sort === "TopAll"
        ? [
            {
              mode: "lemmyv1",
              sort: "TopAll",
            },
            {
              mode: "lemmyv0",
              sort: "Top",
            },
            {
              mode: "piefed",
              sort: "Top",
            },
          ]
        : [
            {
              mode: "lemmyv1",
              sort,
            },
            {
              mode: "lemmyv0",
              sort,
            },
            {
              mode: "piefed",
              sort,
            },
          ],
    ]),
  ),
  New: [
    {
      mode: "lemmyv1",
      sort: "New",
    },
    {
      mode: "lemmyv0",
      sort: "New",
    },
  ],
  ...Object.fromEntries(
    CONTROVERSIAL_SORTS.children.map((sort) => [
      sort,
      sort === "ControversialAll"
        ? [
            {
              mode: "lemmyv1",
              sort: "ControversialAll",
            },
            {
              mode: "lemmyv0",
              sort: "Controversial",
            },
          ]
        : [
            {
              mode: "lemmyv1",
              sort,
            },
            {
              mode: "lemmyv0",
              sort,
            },
          ],
    ]),
  ),
  Scaled: [
    {
      mode: "lemmyv1",
      sort: "Scaled",
    },
    {
      mode: "lemmyv0",
      sort: "Scaled",
    },
  ],
  MostComments: [
    {
      mode: "lemmyv1",
      sort: "MostComments",
    },
    {
      mode: "lemmyv0",
      sort: "MostComments",
    },
  ],
  NewComments: [
    {
      mode: "lemmyv1",
      sort: "NewComments",
    },
    {
      mode: "lemmyv0",
      sort: "NewComments",
    },
  ],
} as Record<LemmyPostSortType, PostSortType[]>;

const flattenedSortOptions = flattenSortOptions(sortOptions);

export const ALL_POST_SORTS =
  arrayOfAll<VgerPostSortType>()(flattenedSortOptions);

export const {
  Sort: PostSort,
  useSelectSort: useSelectPostSort,
  formatSort: formatPostSort,
} = buildSort(sortOptions, POST_SORT_SUPPORT);
