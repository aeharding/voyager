import { useParams } from "react-router-dom";

import { FetchFn } from "#/features/feed/Feed";
import { PostCommentItem } from "#/features/feed/PostCommentFeed";
import { getUserIfNeeded } from "#/features/user/userSlice";
import useClient from "#/helpers/useClient";
import { LIMIT } from "#/services/lemmy";
import { useAppDispatch } from "#/store";

import BaseProfileFeedItemsPage from "./BaseProfileFeedItemsPage";

export default function ProfileFeedSavedPage() {
  const { handle } = useParams<{ handle: string }>();
  const client = useClient();
  const dispatch = useAppDispatch();

  const fetchFn: FetchFn<PostCommentItem> = async (pageData, ...rest) => {
    const person = await dispatch(getUserIfNeeded(handle));

    return client.listPersonSaved(
      {
        ...pageData,
        person_id: person.id,
        limit: LIMIT,
      },
      ...rest,
    );
  };

  return <BaseProfileFeedItemsPage label="Saved" fetchFn={fetchFn} />;
}
