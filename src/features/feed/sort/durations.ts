import type { PrefixedStringTuple } from "#/helpers/typescript";

export const ALL_DURATIONS = [
  "Hour",
  "SixHour",
  "TwelveHour",
  "Day",
  "Week",
  "Month",
  "ThreeMonths",
  "SixMonths",
  "NineMonths",
  "Year",
  "All",
] as const;

export type VgerDuration = (typeof ALL_DURATIONS)[number];

export function createSortFromDurations<
  Sort extends string,
  Durations extends readonly string[],
>(sort: Sort, durations: Durations) {
  return durations.map(
    (duration) => `${sort}${duration}`,
  ) as PrefixedStringTuple<Sort, Durations>;
}

export function convertDurationToSeconds(duration: VgerDuration) {
  switch (duration) {
    case "Hour":
      return 3600;
    case "SixHour":
      return 21600;
    case "TwelveHour":
      return 43200;
    case "Day":
      return 86400;
    case "Week":
      return 604800;
    case "Month":
      return 2592000;
    case "Year":
      return 31536000;
    case "ThreeMonths":
      return 7776000;
    case "SixMonths":
      return 15811200;
    case "NineMonths":
      return 2147483647;
    case "All":
      return undefined;
  }

  duration satisfies never;
}
