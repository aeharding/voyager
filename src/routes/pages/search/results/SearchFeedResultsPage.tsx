import {
  IonBackButton,
  IonButtons,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { CommentView, PostView } from "lemmy-js-client";
import { useParams } from "react-router";

import { receivedComments } from "#/features/comment/commentSlice";
import { getSortDuration } from "#/features/feed/endItems/EndPost";
import { FetchFn } from "#/features/feed/Feed";
import PostCommentFeed, {
  PostCommentItem,
} from "#/features/feed/PostCommentFeed";
import { SearchSort } from "#/features/feed/sort/SearchSort";
import useFeedSort, {
  useFeedSortParams,
} from "#/features/feed/sort/useFeedSort";
import { receivedPosts } from "#/features/post/postSlice";
import AppHeader from "#/features/shared/AppHeader";
import { isPost } from "#/helpers/lemmy";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import useClient from "#/helpers/useClient";
import FeedContent from "#/routes/pages/shared/FeedContent";
import { LIMIT } from "#/services/lemmy";
import { useAppDispatch } from "#/store";

interface SearchPostsResultsProps {
  type: "Posts" | "Comments";
}

export default function SearchFeedResultsPage({
  type,
}: SearchPostsResultsProps) {
  const dispatch = useAppDispatch();
  const { search: _encodedSearch, community } = useParams<{
    search: string;
    community: string | undefined;
  }>();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const client = useClient();
  const [sort, setSort] = useFeedSort("search", {
    internal: `${type}Search`,
  });
  const sortParams = useFeedSortParams("search", sort, "posts");

  const search = decodeURIComponent(_encodedSearch);

  const fetchFn: FetchFn<PostCommentItem> = async (pageData, ...rest) => {
    const response = await client.search(
      {
        ...pageData,
        limit: LIMIT,
        q: search,
        type_: type,
        community_name: community,
        ...sortParams,
      },
      ...rest,
    );

    if ("results" in response) {
      const posts: PostView[] = [];
      const comments: CommentView[] = [];

      for (const item of response.results) {
        if (isPost(item)) posts.push(item);
        else comments.push(item);
      }

      dispatch(receivedPosts(posts));
      dispatch(receivedComments(comments));

      return response.results;
    }

    dispatch(receivedPosts(response.posts));
    dispatch(receivedComments(response.comments));
    return [...response.posts, ...response.comments];
  };

  return (
    <IonPage>
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton
              text="Search"
              defaultHref={buildGeneralBrowseLink("")}
            />
          </IonButtons>

          <IonTitle>“{search}”</IonTitle>

          <IonButtons slot="end">
            <SearchSort sort={sort} setSort={setSort} />
          </IonButtons>
        </IonToolbar>
      </AppHeader>
      <FeedContent>
        <PostCommentFeed
          fetchFn={fetchFn}
          sortDuration={getSortDuration(sort)}
          filterHiddenPosts={false}
          filterKeywordsAndWebsites={false}
        />
      </FeedContent>
    </IonPage>
  );
}
