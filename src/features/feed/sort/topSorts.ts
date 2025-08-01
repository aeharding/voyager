import { barChartOutline } from "ionicons/icons";

import {
  ALL_DURATIONS,
  createSortFromDurations,
  VgerDuration,
} from "./durations";

export const TOP_DURATIONS = ALL_DURATIONS satisfies readonly VgerDuration[];

const TOP_DURATION_SORTS = createSortFromDurations("Top", TOP_DURATIONS);

const TOP = {
  label: "Top",
  icon: barChartOutline,
} as const;

export const LEMMY_TOP_SORTS = {
  ...TOP,
  children: TOP_DURATION_SORTS,
} as const;

export const PIEFED_TOP_SORTS = {
  ...TOP,
  children: [
    "TopHour",
    "TopSixHour",
    "TopTwelveHour",
    "TopDay",
    "TopWeek",
    "TopMonth",
  ],
} as const;

export type VgerTopSort = (typeof TOP_DURATION_SORTS)[number];

type TopTime = (typeof TOP_DURATIONS)[number];

export function topSortToDuration(sort: VgerTopSort) {
  return sort.slice(3) as TopTime;
}

export function isTopSort(sort: string): sort is VgerTopSort {
  return sort.startsWith("Top");
}
