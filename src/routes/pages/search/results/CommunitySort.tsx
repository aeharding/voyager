import { POST_SORT_BY_MODE } from "#/features/feed/sort/PostSort";
import buildSort, { FlattenSortOptions } from "#/routes/pages/shared/Sort";

export const COMMUNITY_SORT_BY_MODE = {
  lemmyv0: POST_SORT_BY_MODE["lemmyv0"],
  lemmyv1: [
    {
      label: "Active",
      children: [
        "ActiveSixMonths",
        "ActiveMonthly",
        "ActiveWeekly",
        "ActiveDaily",
      ],
    },
    "Subscribers",
    "Hot",
    "Posts",
    "Comments",
    "New",
    "Old",
    "NameAsc",
    "NameDesc",
    "SubscribersLocal",
  ],
  piefed: ["Active", "New"],
} as const;

export type VgerCommunitySortTypeByMode = {
  [K in keyof typeof COMMUNITY_SORT_BY_MODE]: FlattenSortOptions<
    (typeof COMMUNITY_SORT_BY_MODE)[K]
  >[number];
};

export type VgerCommunitySortType =
  VgerCommunitySortTypeByMode[keyof VgerCommunitySortTypeByMode];

export const { Sort: CommunitySort, useSelectSort: useSelectCommunitySort } =
  buildSort(COMMUNITY_SORT_BY_MODE);
