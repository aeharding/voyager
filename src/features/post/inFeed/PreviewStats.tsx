import { chatbubbleOutline, timeOutline } from "ionicons/icons";
import { PostView } from "lemmy-js-client";
import Ago from "../../labels/Ago";
import Vote from "../../labels/Vote";
import { formatNumber } from "../../../helpers/number";
import Stat from "../detail/Stat";
import { sharedStatsClass } from "../detail/Stats";

interface PreviewStatsProps {
  post: PostView;
}

export default function PreviewStats({ post }: PreviewStatsProps) {
  return (
    <div className={sharedStatsClass}>
      <Vote item={post} />
      <Stat icon={chatbubbleOutline}>{formatNumber(post.counts.comments)}</Stat>
      <Stat icon={timeOutline}>
        <Ago date={post.post.published} />
      </Stat>
    </div>
  );
}
