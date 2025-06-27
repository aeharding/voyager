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
  formatSortDuration: (() => string | undefined) | undefined;

  renderCustomEmptyContent?: () => React.ReactNode;
}

export default function EndPost({
  empty,
  communityName,
  formatSortDuration,
  renderCustomEmptyContent,
}: EndPostProps) {
  const feedName = communityName ? `c/${communityName}` : "this feed";

  function renderError() {
    if (empty) {
      const sortDuration = formatSortDuration?.();

      if (sortDuration)
        return (
          <div className={styles.container}>
            No posts in {feedName} for last {sortDuration.toLowerCase()}.
          </div>
        );

      if (renderCustomEmptyContent) return renderCustomEmptyContent();

      return (
        <div className={styles.container}>
          <>Nothing to see here — {feedName} is completely empty.</>
        </div>
      );
    }

    return <div className={styles.container}>You&apos;ve reached the end!</div>;
  }

  return renderError();
}
