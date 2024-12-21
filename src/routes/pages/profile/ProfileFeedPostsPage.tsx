import { useParams } from "react-router-dom";

import { FetchFn } from "#/features/feed/Feed";
import { PostCommentItem } from "#/features/feed/PostCommentFeed";
import PostSort from "#/features/feed/PostSort";
import useFeedSort from "#/features/feed/sort/useFeedSort";
import useClient from "#/helpers/useClient";
import { LIMIT } from "#/services/lemmy";

import BaseProfileFeedItemsPage from "./BaseProfileFeedItemsPage";

export default function ProfileFeedPostsPage() {
  const client = useClient();
  const { handle } = useParams<{ handle: string }>();

  const [sort, setSort] = useFeedSort(
    "posts",
    {
      internal: `ProfilePosts`,
    },
    "New",
  );

  const fetchFn: FetchFn<PostCommentItem> = async (pageData, ...rest) => {
    const { posts } = await client.getPersonDetails(
      {
        ...pageData,
        limit: LIMIT,
        username: handle,
        sort: sort ?? "New",
      },
      ...rest,
    );

    return posts;
  };

  return (
    <BaseProfileFeedItemsPage
      label="Posts"
      fetchFn={fetchFn}
      sortComponent={<PostSort sort={sort} setSort={setSort} />}
    />
  );
}
