import {
  IonBackButton,
  IonButtons,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useAppDispatch, useAppSelector } from "../../../store";
import useClient from "../../../helpers/useClient";
import { FetchFn } from "../../../features/feed/Feed";
import { useCallback, useRef } from "react";
import InboxFeed from "../../../features/feed/InboxFeed";
import {
  getInboxItemPublished,
  receivedInboxItems,
  totalUnreadSelector,
} from "../../../features/inbox/inboxSlice";
import MarkAllAsReadButton from "./MarkAllAsReadButton";
import { InboxItemView } from "../../../features/inbox/InboxItem";
import FeedContent from "../shared/FeedContent";
import { useSetActivePage } from "../../../features/auth/AppContext";
import { receivedUsers } from "../../../features/user/userSlice";
import AppHeader from "../../../features/shared/AppHeader";

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

  const fetchFn: FetchFn<InboxItemView> = useCallback(
    async (pageData) => {
      const params = {
        limit: 50,
        ...pageData,
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
    },
    [client, dispatch, myUserId, showRead],
  );

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
