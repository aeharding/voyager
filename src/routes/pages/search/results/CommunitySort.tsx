import buildSort, { SortOptions } from "#/routes/pages/shared/Sort";

export type LemmyCommunitySortType =
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

export type VgerCommunitySortType = LemmyCommunitySortType;

const sortOptions: SortOptions<VgerCommunitySortType> = [
  {
    label: "Active",
    children: [
      "ActiveSixMonths",
      "ActiveMonthly",
      "ActiveWeekly",
      "ActiveDaily",
    ] as const,
  },
  "Hot",
  "New",
  "Old",
  "NameAsc",
  "NameDesc",
  "Comments",
  "Posts",
  "Subscribers",
  "SubscribersLocal",
] as const;

export const { Sort: CommunitySort, useSelectSort: useSelectCommunitySort } =
  buildSort(sortOptions);
