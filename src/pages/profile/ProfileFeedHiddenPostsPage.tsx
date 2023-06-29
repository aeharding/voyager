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
import styled from "@emotion/styled";
import useClient from "../../helpers/useClient";
import { LIMIT } from "../../services/lemmy";
import { FetchFn } from "../../features/feed/Feed";
import { useParams } from "react-router";
import { useAppSelector } from "../../store";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import PostCommentFeed, {
  PostCommentItem,
} from "../../features/feed/PostCommentFeed";
import { jwtSelector } from "../../features/auth/authSlice";

export const InsetIonItem = styled(IonItem)`
  --background: var(--ion-tab-bar-background, var(--ion-color-step-50, #fff));
`;

export const SettingLabel = styled(IonLabel)`
  margin-left: 1rem;
`;

interface ProfileFeedItemsPageProps {}
export default function ProfileFeeHiddenPostsPage({}: ProfileFeedItemsPageProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const { handle } = useParams<{ handle: string }>();
  const jwt = useAppSelector(jwtSelector);
  const client = useClient();
  const hiddenPosts = useAppSelector((state) => state.post.hiddenPosts);

  const fetchFn: FetchFn<PostCommentItem> = useCallback(
    async (page) => {
      const currentPageItems = hiddenPosts.slice(
        (page - 1) * LIMIT,
        page * LIMIT
      );

      const result = await Promise.all(
        currentPageItems.map((postId) =>
          client.getPost({ id: postId, auth: jwt })
        )
      );

      return result.map((post) => post.post_view);
    },
    [client, hiddenPosts, jwt]
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Hidden Posts</IonTitle>
          <IonButtons slot="start">
            <IonBackButton
              text={handle}
              defaultHref={buildGeneralBrowseLink(`/u/${handle}`)}
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
