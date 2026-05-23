import { LikeType } from "threadiverse";

import { FetchFn } from "#/features/feed/Feed";
import { PostCommentItem } from "#/features/feed/PostCommentFeed";
import useClient from "#/helpers/useClient";
import { LIMIT } from "#/services/lemmy";

import BaseProfileFeedItemsPage from "./BaseProfileFeedItemsPage";

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

  const fetchFn: FetchFn<PostCommentItem> = async (page_cursor, ...rest) => {
    return client.listPersonLiked(
      { page_cursor, like_type: likeType, limit: LIMIT },
      ...rest,
    );
  };

  return (
    <BaseProfileFeedItemsPage label={LABELS[likeType]} fetchFn={fetchFn} />
  );
}
