import { FetchFn } from "#/features/feed/Feed";
import { PostCommentItem } from "#/features/feed/PostCommentFeed";
import useClient from "#/helpers/useClient";
import { LIMIT } from "#/services/lemmy";

import BaseProfileFeedItemsPage from "./BaseProfileFeedItemsPage";

interface ProfileFeedVotedPageProps {
  type: "Upvoted" | "Downvoted";
}

export default function ProfileFeedVotedPage({
  type,
}: ProfileFeedVotedPageProps) {
  const client = useClient();

  const fetchFn: FetchFn<PostCommentItem> = async (pageData, ...rest) => {
    return client.listPersonLiked({ ...pageData, type, limit: LIMIT }, ...rest);
  };

  return <BaseProfileFeedItemsPage label={type} fetchFn={fetchFn} />;
}
