import { compare, CompareOperator } from "compare-versions";
import { memoize } from "es-toolkit";
import { CommentSortType, PostSortType } from "lemmy-js-client";

import { lemmyVersionSelector } from "#/features/auth/siteSlice";
import { useAppSelector } from "#/store";

/**
 * What version was support removed?
 */
const SUPPORTED_ON_OLDER_EXCLUSIVE = ">";

/**
 * What version was support added?
 */
const SUPPORTED_ON_NEWER_INCLUSIVE = "<=";

const memoizedCompare = memoize(
  ([v1, v2, cmp]: Parameters<typeof compare>) => compare(v1, v2, cmp),
  {
    getCacheKey: ([v1, v2, cmp]) => `${v1}${v2}${cmp}`,
  },
);

/**
 * Default: `SUPPORTED_ON_NEWER_INCLUSIVE` (what version was support added?)
 */
const featureVersionSupported = {
  /**
   * https://github.com/LemmyNet/lemmy-ui/issues/2796
   */
  "Fullsize thumbnails": ["0.19.6", SUPPORTED_ON_OLDER_EXCLUSIVE],

  /**
   * https://github.com/LemmyNet/lemmy/issues/5183
   */
  "Random community API": "0.20.0",
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

  return memoizedCompare([version, lemmyVersion, comparator]);
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
