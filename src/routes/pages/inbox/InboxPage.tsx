import {
  IonBackButton,
  IonButtons,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useRef } from "react";

import { useSetActivePage } from "#/features/auth/AppContext";
import { FetchFn } from "#/features/feed/Feed";
import InboxFeed from "#/features/feed/InboxFeed";
import { InboxItemView } from "#/features/inbox/InboxItem";
import {
  getInboxItemPublished,
  receivedInboxItems,
  totalUnreadSelector,
} from "#/features/inbox/inboxSlice";
import AppHeader from "#/features/shared/AppHeader";
import { receivedUsers } from "#/features/user/userSlice";
import useClient from "#/helpers/useClient";
import FeedContent from "#/routes/pages/shared/FeedContent";
import { useAppDispatch, useAppSelector } from "#/store";

import MarkAllAsReadButton from "./MarkAllAsReadButton";

interface InboxPageProps {
  showRead?: boolean;
}

export default function InboxPage({ showRead }: InboxPageProps) {
  const pageRef = useRef<HTMLElement>(null);
  const dispatch = useAppDispatch();
  const client = useClient();
  const myUserId = useAppSelector(
    (state) =>
      state.site.response?.my_user?.local_user_view?.local_user?.person_id,
  );
  const totalUnread = useAppSelector(totalUnreadSelector);

  useSetActivePage(pageRef);

  const fetchFn: FetchFn<InboxItemView> = async (pageData, ...rest) => {
    if (!myUserId) return [];

    const params = {
      limit: 50,
      ...pageData,
      unread_only: !showRead,
    };

    const [replies, mentions, privateMessages] = await Promise.all([
      client.getReplies(
        {
          ...params,
          sort: "New",
        },
        ...rest,
      ),
      client.getPersonMentions(
        {
          ...params,
          sort: "New",
        },
        ...rest,
      ),
      client.getPrivateMessages(params, ...rest),
    ]);

    const everything = [
      ...replies.replies,
      ...mentions.mentions,
      ...privateMessages.private_messages.filter(
        (message) =>
          message.creator.id !== myUserId ||
          message.creator.id === message.recipient.id, // if you message yourself, show it (lemmy returns as a notification)
      ),
    ].sort(
      (a, b) =>
        Date.parse(getInboxItemPublished(b)) -
        Date.parse(getInboxItemPublished(a)),
    );

    dispatch(receivedInboxItems(everything));
    dispatch(
      receivedUsers([
        ...everything.map(({ creator }) => creator),
        ...everything.map(({ recipient }) => recipient),
      ]),
    );

    return everything;
  };

  return (
    <IonPage ref={pageRef}>
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/inbox" text="Boxes" />
          </IonButtons>

          <IonTitle>
            {showRead ? "Inbox" : "Unread"}{" "}
            {totalUnread ? ` (${totalUnread})` : ""}
          </IonTitle>

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
