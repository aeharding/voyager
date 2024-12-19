import { GetComments, GetPosts } from "lemmy-js-client";

import { FetchFn } from "#/features/feed/Feed";
import { PostCommentItem } from "#/features/feed/PostCommentFeed";
import { sortPostCommentByPublished } from "#/helpers/lemmy";
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
    const requestPayload: GetPosts & GetComments = {
      ...pageData,
      limit: Math.floor(LIMIT / 2),
      sort: "New",
      liked_only: type === "Upvoted",
      disliked_only: type === "Downvoted",
      show_read: true,
    };

    const [{ posts }, { comments }] = await Promise.all([
      client.getPosts(requestPayload, ...rest),
      client.getComments(requestPayload, ...rest),
    ]);

    return [...comments, ...posts].sort(sortPostCommentByPublished);
  };

  return <BaseProfileFeedItemsPage label={type} fetchFn={fetchFn} />;
}
