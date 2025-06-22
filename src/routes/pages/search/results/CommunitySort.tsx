import buildSort, { SortOptionsByMode } from "#/routes/pages/shared/Sort";

export type VgerCommunitySortType =
  | "ActiveSixMonths"
  | "ActiveMonthly"
  | "ActiveWeekly"
  | "ActiveDaily"
  | "Hot"
  | "New"
  | "Old"
  | "NameAsc"
  | "NameDesc"
  | "Comments"
  | "Posts"
  | "Subscribers"
  | "SubscribersLocal";

const sortOptionsByMode = {
  lemmyv0: [
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
  ],
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
  piefed: [
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
  ],
} as const satisfies SortOptionsByMode<VgerCommunitySortType>;

export const { Sort: CommunitySort, useSelectSort: useSelectCommunitySort } =
  buildSort(sortOptionsByMode);
