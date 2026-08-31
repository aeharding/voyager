import { CommentSort } from "#/features/comment/CommentSort";
import { AbortLoadError, FetchFn } from "#/features/feed/Feed";
import { PostCommentItem } from "#/features/feed/PostCommentFeed";
import useFeedSort, {
  getProfileCommentSort,
  getProfileCommentSortParams,
} from "#/features/feed/sort/useFeedSort";
import { getUserIfNeeded } from "#/features/user/userSlice";
import { useMode } from "#/helpers/threadiverse";
import useClient from "#/helpers/useClient";
import useRequiredParams from "#/helpers/useRequiredParams";
import { LIMIT } from "#/services/lemmy";
import { useAppDispatch } from "#/store";

import BaseProfileFeedItemsPage from "./BaseProfileFeedItemsPage";

export default function ProfileFeedCommentsPage() {
  const client = useClient();
  const { handle } = useRequiredParams<{ handle: string }>();
  const dispatch = useAppDispatch();
  const mode = useMode();

  const [sort, setSort] = useFeedSort(
    "comments",
    {
      internal: `ProfileComments`,
    },
    "New",
  );
  const effectiveSort = getProfileCommentSort(mode, sort);
  const sortParams = getProfileCommentSortParams(mode, effectiveSort);

  const fetchFn: FetchFn<PostCommentItem> = async (page_cursor, ...rest) => {
    if (sortParams === undefined) throw new AbortLoadError();

    const person = await dispatch(getUserIfNeeded(handle));

    return client.listPersonContent(
      {
        page_cursor,
        type: "comments",
        limit: LIMIT,
        person_id: person.id,
        ...sortParams,
      },
      ...rest,
    );
  };

  return (
    <BaseProfileFeedItemsPage
      label="Comments"
      fetchFn={fetchFn}
      sortComponent={
        mode !== "lemmyv1" && (
          <CommentSort sort={effectiveSort} setSort={setSort} />
        )
      }
    />
  );
}
