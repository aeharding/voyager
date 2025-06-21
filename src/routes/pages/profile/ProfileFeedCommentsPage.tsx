import { useParams } from "react-router-dom";
import { CommentSortType, PostSortType } from "threadiverse";

import { FetchFn } from "#/features/feed/Feed";
import { PostCommentItem } from "#/features/feed/PostCommentFeed";
import { SearchSort } from "#/features/feed/sort/SearchSort";
import useFeedSort, {
  useFeedSortParams,
} from "#/features/feed/sort/useFeedSort";
import useClient from "#/helpers/useClient";
import { LIMIT } from "#/services/lemmy";

import BaseProfileFeedItemsPage from "./BaseProfileFeedItemsPage";

export default function ProfileFeedCommentsPage() {
  const client = useClient();
  const { handle } = useParams<{ handle: string }>();

  const [sort, setSort] = useFeedSort(
    "search",
    {
      internal: `ProfileComments`,
    },
    "New",
  );
  const sortParams = useFeedSortParams("search", sort, "posts");

  const fetchFn: FetchFn<PostCommentItem> = async (pageData, ...rest) => {
    const { comments } = await client.getPersonDetails(
      {
        ...pageData,
        limit: LIMIT,
        username: handle,
        ...sortParams,
      },
      ...rest,
    );

    return comments;
  };

  return (
    <BaseProfileFeedItemsPage
      label="Comments"
      fetchFn={fetchFn}
      sortComponent={<SearchSort sort={sort} setSort={setSort} />}
    />
  );
}
