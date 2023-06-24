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

export const InsetIonItem = styled(IonItem)`
  --background: var(--ion-tab-bar-background, var(--ion-color-step-50, #fff));
`;

export const SettingLabel = styled(IonLabel)`
  margin-left: 1rem;
`;

interface ProfileFeedItemsPageProps {
  type: "Comments" | "Posts";
}
export default function ProfileFeedItemsPage({
  type,
}: ProfileFeedItemsPageProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const { handle } = useParams<{ handle: string }>();
  const jwt = useAppSelector((state) => state.auth.jwt);
  const client = useClient();

  const fetchFn: FetchFn<PostCommentItem> = useCallback(
    async (page) => {
      const response = await client.getPersonDetails({
        limit: LIMIT,
        username: handle,
        page,
        sort: "New",
        auth: jwt,
      });
      return type === "Comments" ? response.comments : response.posts;
    },
    [client, handle, jwt, type]
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{type}</IonTitle>
          <IonButtons slot="start">
            <IonBackButton
              text={handle}
              defaultHref={buildGeneralBrowseLink(`/u/${handle}`)}
            />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <PostCommentFeed fetchFn={fetchFn} />
      </IonContent>
    </IonPage>
  );
}
