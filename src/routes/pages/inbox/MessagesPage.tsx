import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonList,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { jwtPayloadSelector } from "#/features/auth/authSelectors";
import {
  conversationsByPersonIdSelector,
  syncMessages,
} from "#/features/inbox/inboxSlice";
import ConversationItem from "#/features/inbox/messages/ConversationItem";
import { MaxWidthContainer } from "#/features/shared/AppContent";
import AppHeader from "#/features/shared/AppHeader";
import { CenteredSpinner } from "#/features/shared/CenteredSpinner";
import { AppPage } from "#/helpers/AppPage";
import { useAppDispatch, useAppSelector } from "#/store";

import ComposeButton from "./ComposeButton";
import MarkAllAsReadButton from "./MarkAllAsReadButton";

export default function MessagesPage() {
  const dispatch = useAppDispatch();
  const messages = useAppSelector((state) => state.inbox.messages);
  const jwtPayload = useAppSelector(jwtPayloadSelector);
  const [loading, setLoading] = useState(false);
  const conversationsByPersonId = useAppSelector(
    conversationsByPersonIdSelector,
  );

  const groupedConversations = useMemo(
    () => Object.values(conversationsByPersonId),
    [conversationsByPersonId],
  );

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      await dispatch(syncMessages());
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchItems();
  }, [dispatch, jwtPayload, fetchItems]);

  const content = (() => {
    if (!messages.length && loading) return <CenteredSpinner />;

    return (
      <MaxWidthContainer>
        <IonList>
          {groupedConversations.map((conversationMessages, index) => (
            <ConversationItem key={index} messages={conversationMessages} />
          ))}
        </IonList>
      </MaxWidthContainer>
    );
  })();

  return (
    <AppPage>
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/inbox" text="Boxes" />
          </IonButtons>

          <IonTitle>Messages</IonTitle>

          <IonButtons slot="end">
            <MarkAllAsReadButton />
            <ComposeButton />
          </IonButtons>
        </IonToolbar>
      </AppHeader>
      <IonContent>
        <IonRefresher
          slot="fixed"
          onIonRefresh={async (e) => {
            try {
              await dispatch(syncMessages());
            } finally {
              e.detail.complete();
            }
          }}
        >
          <IonRefresherContent />
        </IonRefresher>

        {content}
      </IonContent>
    </AppPage>
  );
}
