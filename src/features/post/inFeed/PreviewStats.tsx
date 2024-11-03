import { chatbubbleOutline } from "ionicons/icons";
import { PostView } from "lemmy-js-client";

import Ago from "#/features/labels/Ago";
import Vote from "#/features/labels/Vote";
import Stat from "#/features/post/detail/Stat";
import { sharedStatsClass } from "#/features/post/detail/Stats";
import TimeStat from "#/features/post/detail/TimeStat";
import { formatNumber } from "#/helpers/number";

interface PreviewStatsProps {
  post: PostView;
}

export default function PreviewStats({ post }: PreviewStatsProps) {
  return (
    <div className={sharedStatsClass}>
      <Vote item={post} />
      <Stat icon={chatbubbleOutline}>{formatNumber(post.counts.comments)}</Stat>
      <TimeStat>
        <Ago date={post.post.published} />
      </TimeStat>
    </div>
  );
}
