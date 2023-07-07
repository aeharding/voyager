import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import { useCallback, useContext } from "react";
import { FetchFn } from "../../../features/feed/Feed";
import useClient from "../../../helpers/useClient";
import { LIMIT } from "../../../services/lemmy";
import { useParams } from "react-router";
import PostSort from "../../../features/feed/postSort/PostSort";
import { useAppDispatch } from "../../../store";
import PostCommentFeed, {
  PostCommentItem,
} from "../../../features/feed/PostCommentFeed";
import { receivedPosts } from "../../../features/post/postSlice";
import { receivedComments } from "../../../features/comment/commentSlice";
import {
  PostSortContext,
  PostSortContextProvider,
} from "../../../features/feed/postSort/PostSortProvider";

interface SearchPostsResultsProps {
  type: "Posts" | "Comments";
}

export default function SearchPostsResults(props: SearchPostsResultsProps) {
  return (
    <PostSortContextProvider>
      <SearchPostsResultsWithSort {...props} />
    </PostSortContextProvider>
  );
}

function SearchPostsResultsWithSort({ type }: SearchPostsResultsProps) {
  const dispatch = useAppDispatch();
  const { search: _encodedSearch } = useParams<{ search: string }>();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const client = useClient();
  const { sort } = useContext(PostSortContext);

  const search = decodeURIComponent(_encodedSearch);

  const fetchFn: FetchFn<PostCommentItem> = useCallback(
    async (page) => {
      const response = await client.search({
        limit: LIMIT,
        q: search,
        type_: type,
        page,
        sort,
      });
      dispatch(receivedPosts(response.posts));
      dispatch(receivedComments(response.comments));
      return [...response.posts, ...response.comments];
    },
    [search, client, sort, type, dispatch]
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton
              text="Search"
              defaultHref={buildGeneralBrowseLink("")}
            />
          </IonButtons>

          <IonTitle>“{search}”</IonTitle>

          <IonButtons slot="end">
            <PostSort />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <PostCommentFeed fetchFn={fetchFn} />
      </IonContent>
    </IonPage>
  );
}
