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

export default function ProfileFeedCommentsPage() {
  const client = useClient();
  const { handle } = useParams<{ handle: string }>();
  const dispatch = useAppDispatch();

  const [sort, setSort] = useFeedSort(
    "search",
    {
      internal: `ProfileComments`,
    },
    "New",
  );
  const sortParams = useFeedSortParams("search", sort);

  const fetchFn: FetchFn<PostCommentItem> = async (pageData, ...rest) => {
    if (!sortParams) throw new AbortLoadError();

    const person = await dispatch(getUserIfNeeded(handle));

    const { content } = await client.listPersonContent(
      {
        ...pageData,
        type: "Comments",
        limit: LIMIT,
        person_id: person.id,
        ...sortParams,
      },
      ...rest,
    );

    return content;
  };

  return (
    <BaseProfileFeedItemsPage
      label="Comments"
      fetchFn={fetchFn}
      sortComponent={<SearchSort sort={sort} setSort={setSort} />}
    />
  );
}
