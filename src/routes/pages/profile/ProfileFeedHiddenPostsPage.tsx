import { useCallback, useRef } from "react";
import {
  IonLabel,
  IonPage,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonButton,
} from "@ionic/react";
import { useParams } from "react-router";
import useClient from "../../../helpers/useClient";
import { FetchFn } from "../../../features/feed/Feed";
import store, { useAppSelector } from "../../../store";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import PostCommentFeed, {
  PostCommentItem,
} from "../../../features/feed/PostCommentFeed";
import { userHandleSelector } from "../../../features/auth/authSelectors";
import { IPostMetadata, db } from "../../../services/db";
import { postHiddenByIdSelector } from "../../../features/post/postSlice";
import FeedContent from "../shared/FeedContent";
import { styled } from "@linaria/react";
import AppHeader from "../../../features/shared/AppHeader";
import useResetHiddenPosts from "../../../features/feed/useResetHiddenPosts";

export const SettingLabel = styled(IonLabel)`
  margin-left: 1rem;
`;

// Currently, we have to fetch each post with a separate API call.
// That's why the page size is only 10
const LIMIT = 10;

export default function ProfileFeedHiddenPostsPage() {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const handle = useAppSelector(userHandleSelector);
  const { handle: handleWithoutServer } = useParams<{ handle: string }>();
  const client = useClient();

  // This is just used to trigger a re-render when the list changes
  const postHiddenById = useAppSelector(postHiddenByIdSelector);

  const resetHiddenPosts = useResetHiddenPosts();

  const lastPageNumberRef = useRef(1);
  const lastPageItemsRef = useRef<IPostMetadata[]>([]);

  const fetchFn: FetchFn<PostCommentItem> = useCallback(
    async (pageData) => {
      // Trigger rerender when this changes
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      postHiddenById;

      if (!handle) return [];
      if (!("page" in pageData)) return [];
      const { page } = pageData;

      const hiddenPostMetadatas = await db.getHiddenPostMetadatasPaginated(
        handle,
        page,
        LIMIT,
        // If we're switching to the next page then we can pass the last page's
        // items to the db so that it can use them to determine the next page's
        // items. This is a performance optimization. If we're jumping to a
        // random page then we can't do this. Normally this shouldn't happen
        // because we're only ever fetching the next page. But just in case...
        lastPageNumberRef.current + 1 === page
          ? lastPageItemsRef.current
          : undefined,
      );

      lastPageNumberRef.current = page;
      lastPageItemsRef.current = hiddenPostMetadatas;

      const postIds = hiddenPostMetadatas.map((metadata) => metadata.post_id);

      const result = await Promise.all(
        postIds.map((postId) => {
          const potentialPost = store.getState().post.postById[postId];
          if (typeof potentialPost === "object") return potentialPost;

          return client.getPost({ id: postId });
        }),
      );

      return result.map((post) =>
        "post_view" in post ? post.post_view : post,
      );
    },
    [client, handle, postHiddenById],
  );

  return (
    <IonPage>
      <AppHeader>
        <IonToolbar>
          <IonTitle>Hidden Posts</IonTitle>
          <IonButtons slot="start">
            <IonBackButton
              text={handleWithoutServer}
              defaultHref={buildGeneralBrowseLink(`/u/${handleWithoutServer}`)}
            />
          </IonButtons>
          <IonButtons slot="end">
            <IonButton onClick={() => resetHiddenPosts()} color="danger">
              Reset
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </AppHeader>
      <FeedContent>
        <PostCommentFeed
          fetchFn={fetchFn}
          limit={LIMIT}
          filterHiddenPosts={false}
          filterKeywordsAndWebsites={false}
        />
      </FeedContent>
    </IonPage>
  );
}
