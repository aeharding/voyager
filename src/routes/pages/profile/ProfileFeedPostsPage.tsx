import { useParams } from "react-router-dom";

import { FetchFn } from "#/features/feed/Feed";
import { PostCommentItem } from "#/features/feed/PostCommentFeed";
import { PostSort } from "#/features/feed/sort/PostSort";
import useFeedSort, {
  useFeedSortParams,
} from "#/features/feed/sort/useFeedSort";
import useClient from "#/helpers/useClient";
import { LIMIT } from "#/services/lemmy";

import BaseProfileFeedItemsPage from "./BaseProfileFeedItemsPage";

export default function ProfileFeedPostsPage() {
  const client = useClient();
  const { handle } = useParams<{ handle: string }>();

  const [sort, setSort] = useFeedSort(
    "search",
    {
      internal: `ProfilePosts`,
    },
    "New",
  );
  const sortParams = useFeedSortParams("search", sort ?? "New", "posts");

  const fetchFn: FetchFn<PostCommentItem> = async (pageData, ...rest) => {
    const { posts } = await client.getPersonDetails(
      // @ts-expect-error This will be fixed when we fully support lemmy v1.0
      {
        ...pageData,
        limit: LIMIT,
        username: handle,
        ...sortParams,
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
