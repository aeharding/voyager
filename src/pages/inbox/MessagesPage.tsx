import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonList,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useAppDispatch, useAppSelector } from "../../store";
import { useEffect, useMemo, useState } from "react";
import MarkAllAsReadButton from "./MarkAllAsReadButton";
import { groupBy, sortBy } from "lodash";
import { jwtPayloadSelector } from "../../features/auth/authSlice";
import ConversationItem from "../../features/inbox/messages/ConversationItem";
import { MaxWidthContainer } from "../../features/shared/AppContent";
import { syncMessages } from "../../features/inbox/inboxSlice";
import ComposeButton from "./ComposeButton";
import { CenteredSpinner } from "../posts/PostPage";

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
      sortBy(
        Object.values(
          groupBy(messages, (m) =>
            m.private_message.creator_id === myUserId
              ? m.private_message.recipient_id
              : m.private_message.creator_id
          )
        ).map((messages) =>
          sortBy(messages, (m) => -Date.parse(m.private_message.published))
        ),
        (group) => -Date.parse(group[0].private_message.published)
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
            <ComposeButton />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
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
        {(!messages.length && loading) || !myUserId ? (
          <CenteredSpinner />
        ) : (
          <MaxWidthContainer>
            <IonList>
              {messagesByCreator.map((conversationMessages, index) => (
                <ConversationItem key={index} messages={conversationMessages} />
              ))}
            </IonList>
          </MaxWidthContainer>
        )}
      </IonContent>
    </IonPage>
  );
}
