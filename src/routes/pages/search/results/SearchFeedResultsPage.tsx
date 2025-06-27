import { IonBackButton, IonButtons, IonTitle, IonToolbar } from "@ionic/react";
import { useParams } from "react-router";
import { CommentView, PostView } from "threadiverse";

import { receivedComments } from "#/features/comment/commentSlice";
import { AbortLoadError, FetchFn } from "#/features/feed/Feed";
import PostCommentFeed, {
  PostCommentItem,
} from "#/features/feed/PostCommentFeed";
import { SearchSort } from "#/features/feed/sort/SearchSort";
import useFeedSort, {
  useFeedSortParams,
} from "#/features/feed/sort/useFeedSort";
import { receivedPosts } from "#/features/post/postSlice";
import AppHeader from "#/features/shared/AppHeader";
import { AppPage } from "#/helpers/AppPage";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import useClient from "#/helpers/useClient";
import FeedContent from "#/routes/pages/shared/FeedContent";
import { formatTimeLimitedSort } from "#/routes/pages/shared/Sort";
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
  const sortParams = useFeedSortParams("search", sort);

  const search = decodeURIComponent(_encodedSearch);

  const fetchFn: FetchFn<PostCommentItem> = async (page_cursor, ...rest) => {
    if (sortParams === undefined) throw new AbortLoadError();

    const response = await client.search(
      {
        page_cursor,
        limit: LIMIT,
        q: search,
        type_: type,
        community_name: community,
        ...sortParams,
      },
      ...rest,
    );

    const data = response.data as PostCommentItem[];

    switch (type) {
      case "Posts":
        dispatch(receivedPosts(data as PostView[]));
        break;
      case "Comments":
        dispatch(receivedComments(data as CommentView[]));
    }

    return {
      ...response,
      data,
    };
  };

  return (
    <AppPage>
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
          formatSortDuration={() => formatTimeLimitedSort(sort)}
          filterHiddenPosts={false}
          filterKeywordsAndWebsites={false}
        />
      </FeedContent>
    </AppPage>
  );
}
