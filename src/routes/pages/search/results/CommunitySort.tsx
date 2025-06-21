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
  "Subscribers",
  "Hot",
  "Posts",
  "Comments",
  "New",
  "Old",
  "NameAsc",
  "NameDesc",
  // "SubscribersLocal", // TODO decide to add this when lemmy v1 is released
] as const;

export const { Sort: CommunitySort, useSelectSort: useSelectCommunitySort } =
  buildSort(sortOptions);
