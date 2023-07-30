import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useAppDispatch, useAppSelector } from "../../store";
import useClient from "../../helpers/useClient";
import { FetchFn } from "../../features/feed/Feed";
import { useCallback } from "react";
import InboxFeed from "../../features/feed/InboxFeed";
import {
  getInboxItemPublished,
  receivedInboxItems,
} from "../../features/inbox/inboxSlice";
import MarkAllAsReadButton from "./MarkAllAsReadButton";
import { InboxItemView } from "../../features/inbox/InboxItem";
import { jwtSelector } from "../../features/auth/authSlice";
import FeedContent from "../shared/FeedContent";

interface InboxPageProps {
  showRead?: boolean;
}

export default function InboxPage({ showRead }: InboxPageProps) {
  const dispatch = useAppDispatch();
  const jwt = useAppSelector(jwtSelector);
  const client = useClient();
  const myUserId = useAppSelector(
    (state) => state.auth.site?.my_user?.local_user_view?.local_user?.person_id
  );

  const fetchFn: FetchFn<InboxItemView> = useCallback(
    async (page) => {
      if (!jwt) throw new Error("user must be authed");

      const params = {
        limit: 50,
        page,
        auth: jwt,
        unread_only: !showRead,
      };

      const [replies, mentions, privateMessages] = await Promise.all([
        client.getReplies({
          ...params,
          sort: "New",
        }),
        client.getPersonMentions({
          ...params,
          sort: "New",
        }),
        client.getPrivateMessages(params),
      ]);

      const everything = [
        ...replies.replies,
        ...mentions.mentions,
        ...privateMessages.private_messages.filter(
          (message) =>
            message.creator.id !== myUserId ||
            message.creator.id === message.recipient.id // if you message yourself, show it (lemmy returns as a notification)
        ),
      ].sort(
        (a, b) =>
          Date.parse(getInboxItemPublished(b)) -
          Date.parse(getInboxItemPublished(a))
      );

      dispatch(receivedInboxItems(everything));

      return everything;
    },
    [client, dispatch, jwt, myUserId, showRead]
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/inbox" text="Boxes" />
          </IonButtons>

          <IonTitle>{showRead ? "Inbox" : "Unread"}</IonTitle>

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
