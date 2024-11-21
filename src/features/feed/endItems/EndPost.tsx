import { CommentSortType, PostSortType } from "lemmy-js-client";

import styles from "./EndPost.module.css";

export interface EndPostProps {
  empty: boolean | undefined;
  communityName: string | undefined;

  /**
   * If duration is time-limited (for example, top posts of past 2 days)
   * pass that duration here
   *
   * Examples: `"1 hour"` `"6 months"` `"1 week"`
   */
  sortDuration: string | undefined;
}

export default function EndPost({
  empty,
  communityName,
  sortDuration,
}: EndPostProps) {
  const feedName = communityName ? `c/${communityName}` : "this feed";

  function renderError() {
    if (empty) {
      if (sortDuration)
        return (
          <>
            No posts in {feedName} for last {sortDuration}.
          </>
        );

      return <>Nothing to see here — {feedName} is completely empty.</>;
    }

    return <>You&apos;ve reached the end!</>;
  }

  return <div className={styles.container}>{renderError()}</div>;
}

export function getSortDuration(
  sort: PostSortType | CommentSortType | undefined,
): string | undefined {
  switch (sort) {
    case "TopDay":
      return "day";
    case "TopHour":
      return "hour";
    case "TopMonth":
      return "month";
    case "TopNineMonths":
      return "9 months";
    case "TopSixHour":
      return "6 hours";
    case "TopSixMonths":
      return "6 months";
    case "TopThreeMonths":
      return "3 months";
    case "TopTwelveHour":
      return "12 hours";
    case "TopWeek":
      return "week";
    case "TopYear":
      return "year";
  }
}
