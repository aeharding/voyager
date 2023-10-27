import { compare } from "compare-versions";
import { lemmyVersionSelector } from "../features/auth/authSlice";
import { useAppSelector } from "../store";
import { CommentSortType, SortType } from "lemmy-js-client";

/**
 * What Lemmy version was support added?
 */
const featureVersionSupported = {
  "v0.19 Sorts": "0.19.0-rc.3",
} as const;

type Feature = keyof typeof featureVersionSupported;

export default function useSupported(feature: Feature): boolean {
  const lemmyVersion = useAppSelector(lemmyVersionSelector);

  if (!lemmyVersion) return false;

  return compare(featureVersionSupported[feature], lemmyVersion, "<=");
}

export function is019Sort(
  sort: SortType | CommentSortType | undefined,
): boolean {
  switch (sort) {
    case "Controversial":
    case "TopNineMonths":
    case "TopThreeMonths":
    case "TopSixMonths":
    case "Scaled":
      return true;
    default:
      return false;
  }
}
