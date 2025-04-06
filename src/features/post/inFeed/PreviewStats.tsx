import { chatbubbleOutline } from "ionicons/icons";
import { PostView } from "lemmy-js-client";

import Ago from "#/features/labels/Ago";
import Vote from "#/features/labels/vote/Vote";
import Stat from "#/features/post/detail/Stat";
import TimeStat from "#/features/post/detail/TimeStat";
import { getCounts } from "#/helpers/lemmyCompat";
import { formatNumber } from "#/helpers/number";

import styles from "./PreviewStats.module.css";

interface PreviewStatsProps {
  post: PostView;
}

export default function PreviewStats({ post }: PreviewStatsProps) {
  return (
    <div className={styles.container}>
      <Vote item={post} />
      <Stat icon={chatbubbleOutline}>
        {formatNumber(getCounts(post).comments)}
      </Stat>
      <TimeStat>
        <Ago date={post.post.published} />
      </TimeStat>
    </div>
  );
}
