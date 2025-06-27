import { IonBackButton, IonButtons, IonTitle, IonToolbar } from "@ionic/react";
import { PersonMentionView } from "threadiverse";

import { FetchFn } from "#/features/feed/Feed";
import InboxFeed from "#/features/feed/InboxFeed";
import { receivedInboxItems } from "#/features/inbox/inboxSlice";
import AppHeader from "#/features/shared/AppHeader";
import { AppPage } from "#/helpers/AppPage";
import useClient from "#/helpers/useClient";
import FeedContent from "#/routes/pages/shared/FeedContent";
import { LIMIT } from "#/services/lemmy";
import { useAppDispatch } from "#/store";

import MarkAllAsReadButton from "./MarkAllAsReadButton";

export default function MentionsPage() {
  const dispatch = useAppDispatch();
  const client = useClient();

  const fetchFn: FetchFn<PersonMentionView> = async (page_cursor, ...rest) => {
    const response = await client.getPersonMentions(
      {
        page_cursor,
        limit: LIMIT,
        unread_only: false,
      },
      ...rest,
    );

    dispatch(receivedInboxItems(response.data));

    return response;
  };

  return (
    <AppPage>
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
    </AppPage>
  );
}
