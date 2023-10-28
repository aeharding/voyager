import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useAppDispatch } from "../../store";
import useClient from "../../helpers/useClient";
import { LIMIT } from "../../services/lemmy";
import { FetchFn } from "../../features/feed/Feed";
import { useCallback, useRef } from "react";
import { PersonMentionView } from "lemmy-js-client";
import InboxFeed from "../../features/feed/InboxFeed";
import { receivedInboxItems } from "../../features/inbox/inboxSlice";
import MarkAllAsReadButton from "./MarkAllAsReadButton";
import FeedContent from "../shared/FeedContent";
import { useSetActivePage } from "../../features/auth/AppContext";

export default function MentionsPage() {
  const pageRef = useRef<HTMLElement>(null);
  const dispatch = useAppDispatch();
  const client = useClient();

  useSetActivePage(pageRef);

  const fetchFn: FetchFn<PersonMentionView> = useCallback(
    async (page) => {
      const response = await client.getPersonMentions({
        limit: LIMIT,
        page,
        sort: "New",
        unread_only: false,
      });

      dispatch(receivedInboxItems(response.mentions));

      return response.mentions;
    },
    [client, dispatch],
  );

  return (
    <IonPage ref={pageRef}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/inbox" text="Boxes" />
          </IonButtons>

          <IonTitle>Mentions</IonTitle>

          <IonButtons slot="end">
            <MarkAllAsReadButton />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <FeedContent>
        <InboxFeed fetchFn={fetchFn} />
      </FeedContent>
    </IonPage>
  );
}
