import { useParams } from "react-router-dom";

import { AbortLoadError, FetchFn } from "#/features/feed/Feed";
import { PostCommentItem } from "#/features/feed/PostCommentFeed";
import { SearchSort } from "#/features/feed/sort/SearchSort";
import useFeedSort, {
  useFeedSortParams,
} from "#/features/feed/sort/useFeedSort";
import { getUserIfNeeded } from "#/features/user/userSlice";
import useClient from "#/helpers/useClient";
import { LIMIT } from "#/services/lemmy";
import { useAppDispatch } from "#/store";

import BaseProfileFeedItemsPage from "./BaseProfileFeedItemsPage";

export default function ProfileFeedPostsPage() {
  const client = useClient();
  const { handle } = useParams<{ handle: string }>();
  const dispatch = useAppDispatch();

  const [sort, setSort] = useFeedSort(
    "search",
    {
      internal: `ProfilePosts`,
    },
    "New",
  );
  const sortParams = useFeedSortParams("search", sort ?? "New");

  const fetchFn: FetchFn<PostCommentItem> = async (page_cursor, ...rest) => {
    if (sortParams === undefined) throw new AbortLoadError();

    const person = await dispatch(getUserIfNeeded(handle));

    return client.listPersonContent(
      {
        page_cursor,
        type: "Posts",
        limit: LIMIT,
        person_id: person.id,
        ...sortParams,
      },
      ...rest,
    );
  };

  return (
    <BaseProfileFeedItemsPage
      label="Posts"
      fetchFn={fetchFn}
      sortComponent={<SearchSort sort={sort} setSort={setSort} />}
    />
  );
}
