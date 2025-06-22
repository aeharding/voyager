import { useParams } from "react-router-dom";

import { FetchFn } from "#/features/feed/Feed";
import { PostCommentItem } from "#/features/feed/PostCommentFeed";
import useClient from "#/helpers/useClient";
import { LIMIT } from "#/services/lemmy";

import BaseProfileFeedItemsPage from "./BaseProfileFeedItemsPage";

export default function ProfileFeedSavedPage() {
  const { handle } = useParams<{ handle: string }>();
  const client = useClient();

  const fetchFn: FetchFn<PostCommentItem> = async (pageData, ...rest) => {
    const { content } = await client.listPersonSaved(
      {
        ...pageData,
        username: handle,
        limit: LIMIT,
      },
      ...rest,
    );

    return content;
  };

  return <BaseProfileFeedItemsPage label="Saved" fetchFn={fetchFn} />;
}
