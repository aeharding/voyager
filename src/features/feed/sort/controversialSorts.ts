import { createSortFromDurations, VgerDuration } from "./durations";

export const CONTROVERSIAL_DURATIONS = [
  "Hour",
  "Day",
  "Week",
  "Month",
  "Year",
  "All",
] as const satisfies readonly VgerDuration[];

const CONTROVERSIAL_DURATION_SORTS = createSortFromDurations(
  "Controversial",
  CONTROVERSIAL_DURATIONS,
);

export const CONTROVERSIAL_SORTS = {
  label: "Controversial",
  children: CONTROVERSIAL_DURATION_SORTS,
};

export type VgerControversialSort =
  (typeof CONTROVERSIAL_SORTS)["children"][number];

type ControversialTime = (typeof CONTROVERSIAL_DURATIONS)[number];

export function controversialSortToDuration(sort: VgerControversialSort) {
  return sort.slice(13) as ControversialTime;
}

export function isControversialSort(
  sort: string,
): sort is VgerControversialSort {
  return sort.startsWith("Controversial");
}
