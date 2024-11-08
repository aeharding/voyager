import { CompareOperator, compare } from "compare-versions";
import { CommentSortType, PostSortType } from "lemmy-js-client";

import { lemmyVersionSelector } from "../features/auth/siteSlice";
import { useAppSelector } from "../store";

const SUPPORTED_ON_OLDER_EXCLUSIVE = ">";
const SUPPORTED_ON_NEWER_INCLUSIVE = "<=";

/**
 * What Lemmy version was support added?
 */
const featureVersionSupported = {
  // https://github.com/LemmyNet/lemmy-ui/issues/2796
  "Fullsize thumbnails": ["0.19.6", SUPPORTED_ON_OLDER_EXCLUSIVE],
} as const;

type Feature = keyof typeof featureVersionSupported;

export default function useSupported(feature: Feature): boolean {
  const lemmyVersion = useAppSelector(lemmyVersionSelector);

  if (!lemmyVersion) return false;

  const supported = featureVersionSupported[feature];

  let comparator: CompareOperator = SUPPORTED_ON_NEWER_INCLUSIVE;
  let version: string;
  if (typeof supported === "string") {
    version = supported;
  } else {
    version = supported[0];
    comparator = supported[1];
  }

  return compare(version, lemmyVersion, comparator);
}

export function is019Sort(
  sort: PostSortType | CommentSortType | undefined,
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
