import { CommentSortType, PostSortType } from "lemmy-js-client";
import { useParams } from "react-router-dom";

import CommentSort from "#/features/comment/CommentSort";
import { FetchFn } from "#/features/feed/Feed";
import { PostCommentItem } from "#/features/feed/PostCommentFeed";
import useFeedSort from "#/features/feed/sort/useFeedSort";
import useClient from "#/helpers/useClient";
import { LIMIT } from "#/services/lemmy";

import BaseProfileFeedItemsPage from "./BaseProfileFeedItemsPage";

export default function ProfileFeedCommentsPage() {
  const client = useClient();
  const { handle } = useParams<{ handle: string }>();

  const [sort, setSort] = useFeedSort(
    "comments",
    {
      internal: `ProfileComments`,
    },
    "New",
  );

  const fetchFn: FetchFn<PostCommentItem> = async (pageData, ...rest) => {
    const { comments } = await client.getPersonDetails(
      {
        ...pageData,
        limit: LIMIT,
        username: handle,
        sort: sort ? convertCommentSortToPostSort(sort) : "New",
      },
      ...rest,
    );

    return comments;
  };

  return (
    <BaseProfileFeedItemsPage
      label="Comments"
      fetchFn={fetchFn}
      sortComponent={<CommentSort sort={sort} setSort={setSort} />}
    />
  );
}

function convertCommentSortToPostSort(sort: CommentSortType): PostSortType {
  switch (sort) {
    case "Controversial":
    case "Hot":
    case "New":
    case "Old":
      return sort;
    case "Top":
      return "TopAll";
  }
}
