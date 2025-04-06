import { SortOptions } from "#/routes/pages/shared/Sort";

type TopTime =
  | "Day"
  | "Week"
  | "Month"
  | "Year"
  | "All"
  | "Hour"
  | "SixHour"
  | "TwelveHour"
  | "SixMonths"
  | "NineMonths"
  | "ThreeMonths";

export type VgerTopSort = `Top${TopTime}`;

export const TOP_SORTS = {
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
} as const satisfies SortOptions<VgerTopSort>[number];
