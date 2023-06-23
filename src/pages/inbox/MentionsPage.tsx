import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useAppSelector } from "../../store";
import useClient from "../../helpers/useClient";
import { LIMIT } from "../../services/lemmy";
import { FetchFn } from "../../features/feed/Feed";
import { useCallback } from "react";
import { PersonMentionView } from "lemmy-js-client";
import InboxFeed from "../../features/feed/InboxFeed";

export default function MentionsPage() {
  const jwt = useAppSelector((state) => state.auth.jwt);
  const client = useClient();

  if (!jwt) throw new Error("user must be authed");

  const fetchFn: FetchFn<PersonMentionView> = useCallback(
    async (page) => {
      const response = await client.getPersonMentions({
        limit: LIMIT,
        page,
        sort: "New",
        auth: jwt,
        unread_only: false,
      });

      return response.mentions;
    },
    [client, jwt]
  );

  return (
    <IonPage className="grey-bg">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/inbox" text="Boxes" />
          </IonButtons>

          <IonTitle>Mentions</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent scrollY={false}>
        <InboxFeed fetchFn={fetchFn} />
      </IonContent>
    </IonPage>
  );
}
