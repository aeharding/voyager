import {
  IonBackButton,
  IonButtons,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useBuildGeneralBrowseLink } from "../../../../helpers/routes";
import { useCallback } from "react";
import { FetchFn } from "../../../../features/feed/Feed";
import useClient from "../../../../helpers/useClient";
import { LIMIT } from "../../../../services/lemmy";
import { useParams } from "react-router";
import PostSort from "../../../../features/feed/PostSort";
import { useAppDispatch } from "../../../../store";
import PostCommentFeed, {
  PostCommentItem,
} from "../../../../features/feed/PostCommentFeed";
import { receivedPosts } from "../../../../features/post/postSlice";
import { receivedComments } from "../../../../features/comment/commentSlice";
import FeedContent from "../../shared/FeedContent";
import { getSortDuration } from "../../../../features/feed/endItems/EndPost";
import useFeedSort from "../../../../features/feed/sort/useFeedSort";
import AppHeader from "../../../../features/shared/AppHeader";

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
  const [sort, setSort] = useFeedSort("posts");

  const search = decodeURIComponent(_encodedSearch);

  const fetchFn: FetchFn<PostCommentItem> = useCallback(
    async (pageData) => {
      const response = await client.search({
        ...pageData,
        limit: LIMIT,
        q: search,
        type_: type,
        community_name: community,
        sort,
      });
      dispatch(receivedPosts(response.posts));
      dispatch(receivedComments(response.comments));
      return [...response.posts, ...response.comments];
    },
    [search, client, sort, type, dispatch, community],
  );

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
            <PostSort sort={sort} setSort={setSort} />
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
