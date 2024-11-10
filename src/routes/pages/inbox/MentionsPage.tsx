import {
  IonBackButton,
  IonButtons,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { PersonMentionView } from "lemmy-js-client";
import { useRef } from "react";

import { useSetActivePage } from "#/features/auth/AppContext";
import { FetchFn } from "#/features/feed/Feed";
import InboxFeed from "#/features/feed/InboxFeed";
import { receivedInboxItems } from "#/features/inbox/inboxSlice";
import AppHeader from "#/features/shared/AppHeader";
import useClient from "#/helpers/useClient";
import FeedContent from "#/routes/pages/shared/FeedContent";
import { LIMIT } from "#/services/lemmy";
import { useAppDispatch } from "#/store";

import MarkAllAsReadButton from "./MarkAllAsReadButton";

export default function MentionsPage() {
  const pageRef = useRef<HTMLElement>(null);
  const dispatch = useAppDispatch();
  const client = useClient();

  useSetActivePage(pageRef);

  const fetchFn: FetchFn<PersonMentionView> = async (pageData, ...rest) => {
    const response = await client.getPersonMentions(
      {
        ...pageData,
        limit: LIMIT,
        sort: "New",
        unread_only: false,
      },
      ...rest,
    );

    dispatch(receivedInboxItems(response.mentions));

    return response.mentions;
  };

  return (
    <IonPage ref={pageRef}>
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/inbox" text="Boxes" />
          </IonButtons>

          <IonTitle>Mentions</IonTitle>

          <IonButtons slot="end">
            <MarkAllAsReadButton />
          </IonButtons>
        </IonToolbar>
      </AppHeader>
      <FeedContent>
        <InboxFeed fetchFn={fetchFn} />
      </FeedContent>
    </IonPage>
  );
}
