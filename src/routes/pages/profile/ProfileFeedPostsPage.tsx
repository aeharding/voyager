import { AbortLoadError, FetchFn } from "#/features/feed/Feed";
import { PostCommentItem } from "#/features/feed/PostCommentFeed";
import { PostSort } from "#/features/feed/sort/PostSort";
import useFeedSort, {
  getProfilePostSort,
  getProfilePostSortParams,
} from "#/features/feed/sort/useFeedSort";
import { getUserIfNeeded } from "#/features/user/userSlice";
import { useMode } from "#/helpers/threadiverse";
import useClient from "#/helpers/useClient";
import useRequiredParams from "#/helpers/useRequiredParams";
import { LIMIT } from "#/services/lemmy";
import { useAppDispatch } from "#/store";

import BaseProfileFeedItemsPage from "./BaseProfileFeedItemsPage";

export default function ProfileFeedPostsPage() {
  const client = useClient();
  const { handle } = useRequiredParams<{ handle: string }>();
  const dispatch = useAppDispatch();
  const mode = useMode();

  const [sort, setSort] = useFeedSort(
    "posts",
    {
      internal: `ProfilePosts`,
    },
    "New",
  );
  const effectiveSort = getProfilePostSort(mode, sort);
  const sortParams = getProfilePostSortParams(mode, effectiveSort);

  const fetchFn: FetchFn<PostCommentItem> = async (page_cursor, ...rest) => {
    if (sortParams === undefined) throw new AbortLoadError();

    const person = await dispatch(getUserIfNeeded(handle));

    return client.listPersonContent(
      {
        page_cursor,
        type: "posts",
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
      sortComponent={
        mode !== "lemmyv1" && (
          <PostSort sort={effectiveSort} setSort={setSort} />
        )
      }
    />
  );
}
