import { chatbubbleOutline, layersOutline } from "ionicons/icons";
import { PostView } from "threadiverse";

import { modeSelector } from "#/features/auth/siteSlice";
import Ago from "#/features/labels/Ago";
import Vote from "#/features/labels/vote/Vote";
import Stat from "#/features/post/detail/Stat";
import TimeStat from "#/features/post/detail/TimeStat";
import { formatNumber } from "#/helpers/number";
import { useAppSelector } from "#/store";

import styles from "./PreviewStats.module.css";

interface PreviewStatsProps {
  post: PostView;
}

export default function PreviewStats({ post }: PreviewStatsProps) {
  const mode = useAppSelector(modeSelector);

  // PieFed includes cross_posts (MiniCrossPosts[]) on Post at runtime, but
  // threadiverse doesn't expose this field in its TypeScript types.
  const crossPostMinis =
    mode === "piefed"
      ? (post.post as { cross_posts?: { reply_count?: number }[] }).cross_posts
      : undefined;

  const totalComments = (() => {
    if (!crossPostMinis?.length) return post.counts.comments;

    return (
      post.counts.comments +
      crossPostMinis.reduce((sum, cp) => sum + (cp.reply_count ?? 0), 0)
    );
  })();

  return (
    <div className={styles.container}>
      <Vote item={post} />
      <Stat icon={chatbubbleOutline}>{formatNumber(totalComments)}</Stat>
      {crossPostMinis?.length ? (
        <Stat icon={layersOutline}>{crossPostMinis.length}</Stat>
      ) : undefined}
      <TimeStat>
        <Ago date={post.post.published} />
      </TimeStat>
    </div>
  );
}
