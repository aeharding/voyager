import { LikeType } from "threadiverse";

import { FetchFn } from "#/features/feed/Feed";
import { PostCommentItem } from "#/features/feed/PostCommentFeed";
import { supportsProfileVotedFeed } from "#/features/user/profileCapabilities";
import { useMode } from "#/helpers/threadiverse";
import useClient from "#/helpers/useClient";

import BaseProfileFeedItemsPage from "./BaseProfileFeedItemsPage";
import { fetchProfileVotedPage } from "./profileVoted";

const LABELS: Record<LikeType, string> = {
  disliked_only: "Downvoted",
  liked_only: "Upvoted",
};

interface ProfileFeedVotedPageProps {
  likeType: LikeType;
}

export default function ProfileFeedVotedPage({
  likeType,
}: ProfileFeedVotedPageProps) {
  const client = useClient();
  const mode = useMode();
  const supported = supportsProfileVotedFeed(mode, likeType);

  const fetchFn: FetchFn<PostCommentItem> = async (page_cursor, ...rest) => {
    return fetchProfileVotedPage(client, likeType, page_cursor, ...rest);
  };

  return (
    <BaseProfileFeedItemsPage
      label={LABELS[likeType]}
      fetchFn={fetchFn}
      renderCustomEmptyContent={
        supported === false
          ? () => (
              <div className="ion-padding ion-text-center">
                {LABELS[likeType]} history is not available on this server.
              </div>
            )
          : undefined
      }
    />
  );
}
