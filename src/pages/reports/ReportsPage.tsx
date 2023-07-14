import {
  IonBackButton,
  IonButtons,
  IonContent,
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
import { InboxItemView } from "../../features/inbox/InboxItem";
import { jwtSelector } from "../../features/auth/authSlice";
import ReportFeed from "../../features/report/ReportFeed";

interface InboxPageProps {
  showRead?: boolean;
}

export default function ReportsPage({ showRead }: InboxPageProps) {
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

      const [posts, comments, privateMessages] = await Promise.all([
        client.listPostReports(params),
        client.listCommentReports(params),
        client.listPrivateMessageReports(params),
      ]);

      const everything = [
        ...posts.post_reports,
        ...comments.comment_reports,
        ...privateMessages.private_message_reports,
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

          {/* <IonButtons slot="end">
            <MarkAllAsReadButton />
          </IonButtons> */}
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <ReportFeed fetchFn={fetchFn} />
      </IonContent>
    </IonPage>
  );
}
