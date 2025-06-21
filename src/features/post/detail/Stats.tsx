import { PostView } from "threadiverse";

import Ago from "#/features/labels/Ago";
import Edited from "#/features/labels/Edited";
import Vote from "#/features/labels/vote/Vote";
import { cx } from "#/helpers/css";

import HappyStat from "./HappyStat";
import TimeStat from "./TimeStat";

import styles from "./Stats.module.css";

interface StatsProps {
  post: PostView;
}

export default function Stats({ post }: StatsProps) {
  return (
    <div className={cx(styles.container, styles.sharedStatsClass)}>
      <Vote item={post} />
      <HappyStat post={post} />
      <TimeStat>
        <Ago date={post.post.published} />
      </TimeStat>
      <Edited item={post} showDate />
    </div>
  );
}
