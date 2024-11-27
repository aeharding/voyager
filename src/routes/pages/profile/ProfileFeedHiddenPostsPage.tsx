import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { compact } from "es-toolkit";
import { useRef } from "react";
import { useParams } from "react-router";

import { userHandleSelector } from "#/features/auth/authSelectors";
import { FetchFn } from "#/features/feed/Feed";
import PostCommentFeed, {
  PostCommentItem,
} from "#/features/feed/PostCommentFeed";
import useResetHiddenPosts from "#/features/feed/useResetHiddenPosts";
import { postHiddenByIdSelector } from "#/features/post/postSlice";
import AppHeader from "#/features/shared/AppHeader";
import { isLemmyError } from "#/helpers/lemmyErrors";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import useClient from "#/helpers/useClient";
import FeedContent from "#/routes/pages/shared/FeedContent";
import { db, IPostMetadata } from "#/services/db";
import store, { useAppSelector } from "#/store";

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

  const fetchFn: FetchFn<PostCommentItem> = async (pageData, ...rest) => {
    postHiddenById; // eslint-disable-line @typescript-eslint/no-unused-expressions -- Trigger rerender when this changes

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
      postIds.map(async (postId) => {
        const potentialPost = store.getState().post.postById[postId];
        if (typeof potentialPost === "object") return potentialPost;

        try {
          return await client.getPost({ id: postId }, ...rest);
        } catch (error) {
          if (
            isLemmyError(error, "couldnt_find_post" as never) ||
            isLemmyError(error, "not_found")
          )
            return;

          throw error;
        }
      }),
    );

    return compact(result).map((post) =>
      "post_view" in post ? post.post_view : post,
    );
  };

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
