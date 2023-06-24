import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useAppDispatch, useAppSelector } from "../../store";
import { useEffect, useMemo, useState } from "react";
import MarkAllAsReadButton from "./MarkAllAsReadButton";
import { groupBy } from "lodash";
import { jwtPayloadSelector } from "../../features/auth/authSlice";
import ConversationItem from "../../features/inbox/messages/ConversationItem";
import AppContent from "../../features/shared/AppContent";
import { PageContentIonSpinner } from "../shared/UserPage";
import { syncMessages } from "../../features/inbox/inboxSlice";

export default function MessagesPage() {
  const dispatch = useAppDispatch();
  const messages = useAppSelector((state) => state.inbox.messages);
  const jwtPayload = useAppSelector(jwtPayloadSelector);
  const myUserId = useAppSelector(
    (state) => state.auth.site?.my_user?.local_user_view?.local_user?.person_id
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, jwtPayload]);

  async function fetchItems() {
    setLoading(true);
    try {
      await dispatch(syncMessages());
    } finally {
      setLoading(false);
    }
  }

  const messagesByCreator = useMemo(
    () =>
      Object.values(
        groupBy(messages, (m) =>
          m.private_message.creator_id === myUserId
            ? m.private_message.recipient_id
            : m.private_message.creator_id
        )
      ),
    [messages, myUserId]
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/inbox" text="Boxes" />
          </IonButtons>

          <IonTitle>Messages</IonTitle>

          <IonButtons slot="end">
            <MarkAllAsReadButton />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <AppContent scrollY>
        {(!messages.length && loading) || !myUserId ? (
          <PageContentIonSpinner />
        ) : (
          <IonList>
            {messagesByCreator.map((conversationMessages, index) => (
              <ConversationItem key={index} messages={conversationMessages} />
            ))}
          </IonList>
        )}
      </AppContent>
    </IonPage>
  );
}
