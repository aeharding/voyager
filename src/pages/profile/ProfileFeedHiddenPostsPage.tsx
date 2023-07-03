import { useCallback } from "react";
import {
  IonLabel,
  IonItem,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
} from "@ionic/react";
import { useParams } from "react-router";
import styled from "@emotion/styled";
import useClient from "../../helpers/useClient";
import { FetchFn } from "../../features/feed/Feed";
import { useAppSelector } from "../../store";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import PostCommentFeed, {
  PostCommentItem,
} from "../../features/feed/PostCommentFeed";
import { handleSelector, jwtSelector } from "../../features/auth/authSlice";
import { db } from "../../services/db";

export const InsetIonItem = styled(IonItem)`
  --background: var(--ion-tab-bar-background, var(--ion-color-step-50, #fff));
`;

export const SettingLabel = styled(IonLabel)`
  margin-left: 1rem;
`;

export default function ProfileFeedHiddenPostsPage() {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const handle = useAppSelector(handleSelector);
  const { handle: handleWithoutServer } = useParams<{ handle: string }>();
  const jwt = useAppSelector(jwtSelector);
  const client = useClient();
  const postById = useAppSelector((state) => state.post.postById);

  const fetchFn: FetchFn<PostCommentItem> = useCallback(
    async (page) => {
      if (!handle) return [];

      const postIds = await db
        .getHiddenPostMetadatas(handle, page)
        .then((metadatas) => metadatas.map((metadata) => metadata.post_id));

      const result = await Promise.all(
        postIds.map((postId) => {
          const potentialPost = postById[postId];
          if (potentialPost) return potentialPost;

          return client.getPost({ id: postId, auth: jwt });
        })
      );

      return result.map((post) =>
        "post_view" in post ? post.post_view : post
      );
    },
    [client, handle, jwt, postById]
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Hidden Posts</IonTitle>
          <IonButtons slot="start">
            <IonBackButton
              text={handleWithoutServer}
              defaultHref={buildGeneralBrowseLink(`/u/${handleWithoutServer}`)}
            />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <PostCommentFeed filterHiddenPosts={false} fetchFn={fetchFn} />
      </IonContent>
    </IonPage>
  );
}
