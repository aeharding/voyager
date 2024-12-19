import { useParams } from "react-router-dom";

import { FetchFn } from "#/features/feed/Feed";
import { PostCommentItem } from "#/features/feed/PostCommentFeed";
import { sortPostCommentByPublished } from "#/helpers/lemmy";
import useClient from "#/helpers/useClient";
import { LIMIT } from "#/services/lemmy";

import BaseProfileFeedItemsPage from "./BaseProfileFeedItemsPage";

export default function ProfileFeedSavedPage() {
  const { handle } = useParams<{ handle: string }>();
  const client = useClient();

  const fetchFn: FetchFn<PostCommentItem> = async (pageData, ...rest) => {
    const { comments, posts } = await client.getPersonDetails(
      {
        ...pageData,
        limit: LIMIT,
        username: handle,
        sort: "New",
        saved_only: true,
      },
      ...rest,
    );

    return [...comments, ...posts].sort(sortPostCommentByPublished);
  };

  return <BaseProfileFeedItemsPage label="Saved" fetchFn={fetchFn} />;
}
