import { happyOutline } from "ionicons/icons";
import { PostView } from "lemmy-js-client";

import Ago from "#/features/labels/Ago";
import Edited from "#/features/labels/Edited";
import Vote from "#/features/labels/Vote";
import { cx } from "#/helpers/css";

import Stat from "./Stat";
import styles from "./Stats.module.css";
import TimeStat from "./TimeStat";

interface StatsProps {
  post: PostView;
}

export default function Stats({ post }: StatsProps) {
  return (
    <div className={cx(styles.container, styles.sharedStatsClass)}>
      <Vote item={post} />
      <Stat icon={happyOutline}>
        {Math.round(
          (post.counts.upvotes + post.counts.downvotes
            ? post.counts.upvotes /
              (post.counts.upvotes + post.counts.downvotes)
            : 1) * 100,
        )}
        %
      </Stat>
      <TimeStat>
        <Ago date={post.post.published} />
      </TimeStat>
      <Edited item={post} showDate />
    </div>
  );
}
