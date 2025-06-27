import { IonBackButton, IonButtons, IonTitle, IonToolbar } from "@ionic/react";

import { FetchFn } from "#/features/feed/Feed";
import InboxFeed from "#/features/feed/InboxFeed";
import { InboxItemView } from "#/features/inbox/InboxItem";
import {
  receivedInboxItems,
  totalUnreadSelector,
} from "#/features/inbox/inboxSlice";
import AppHeader from "#/features/shared/AppHeader";
import { receivedUsers } from "#/features/user/userSlice";
import { AppPage } from "#/helpers/AppPage";
import useClient from "#/helpers/useClient";
import FeedContent from "#/routes/pages/shared/FeedContent";
import { useAppDispatch, useAppSelector } from "#/store";

import MarkAllAsReadButton from "./MarkAllAsReadButton";

interface InboxPageProps {
  showRead?: boolean;
}

export default function InboxPage({ showRead }: InboxPageProps) {
  const dispatch = useAppDispatch();
  const client = useClient();
  const myUserId = useAppSelector(
    (state) => state.site.response?.my_user?.local_user_view?.person.id,
  );
  const totalUnread = useAppSelector(totalUnreadSelector);

  const fetchFn: FetchFn<InboxItemView> = async (page_cursor, ...rest) => {
    if (!myUserId) throw new Error("Logged out");

    const response = await client.getNotifications(
      {
        limit: 50,
        page_cursor,
        unread_only: !showRead,
      },
      ...rest,
    );

    const filteredData = response.data.filter((notification) => {
      if ("private_message" in notification) {
        return (
          notification.creator.id !== myUserId ||
          notification.creator.id === notification.recipient.id
        ); // if you message yourself, show it (lemmy returns as a notification)
      }

      return true;
    });

    dispatch(receivedInboxItems(filteredData));
    dispatch(
      receivedUsers([
        ...filteredData.map(({ creator }) => creator),
        ...filteredData.map(({ recipient }) => recipient),
      ]),
    );

    return { ...response, data: filteredData };
  };

  return (
    <AppPage>
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
    </AppPage>
  );
}
