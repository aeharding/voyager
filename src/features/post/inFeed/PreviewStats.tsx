import { chatbubbleOutline } from "ionicons/icons";
import { PostView } from "threadiverse";

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
  const highlightNewComments = useAppSelector(
    (state) => state.settings.general.comments.highlightNewComments,
  );

  // Locally read this session (overrides the server unread until next refresh).
  const locallyRead = useAppSelector(
    (state) => state.post.postReadCommentsAtById[post.post.id] != null,
  );

  // A never-opened post reports unread_comments === total (Lemmy's SQL falls
  // back to the total when there's no read row), so a pill then is just noise.
  // Mirror lemmy-ui: hide unless unread is non-zero and differs from the total.
  const unread = post.unread_comments;
  const showUnread =
    highlightNewComments &&
    !locallyRead &&
    unread > 0 &&
    unread !== post.post.comments;

  return (
    <div className={styles.container}>
      <Vote item={post} />
      <Stat
        icon={chatbubbleOutline}
        iconClassName={showUnread ? styles.unreadIcon : undefined}
      >
        {formatNumber(post.post.comments)}
        {showUnread && (
          <span className={styles.unreadPill}>+{formatNumber(unread)}</span>
        )}
      </Stat>
      <TimeStat>
        <Ago date={post.post.published_at} />
      </TimeStat>
    </div>
  );
}
