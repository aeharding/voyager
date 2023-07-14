import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useCallback } from "react";
import { jwtSelector } from "../../features/auth/authSlice";
import { FetchFn } from "../../features/feed/Feed";
import ReportFeed from "../../features/report/ReportFeed";
import { ReportItemView } from "../../features/report/ReportItem";
import {
  getReportItemPublished,
  receivedReportItems,
} from "../../features/report/reportSlice";
import useClient from "../../helpers/useClient";
import { useAppDispatch, useAppSelector } from "../../store";

interface ReportsPageProps {
  showRead?: boolean;
}

export default function ReportsPage({ showRead }: ReportsPageProps) {
  const dispatch = useAppDispatch();
  const jwt = useAppSelector(jwtSelector);
  const client = useClient();
  const myUserId = useAppSelector(
    (state) => state.auth.site?.my_user?.local_user_view?.local_user?.person_id
  );

  const fetchFn: FetchFn<ReportItemView> = useCallback(
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
          Date.parse(getReportItemPublished(b)) -
          Date.parse(getReportItemPublished(a))
      );

      dispatch(receivedReportItems(everything));

      return everything;
    },
    [client, dispatch, jwt, showRead]
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/reports" text="Boxes" />
          </IonButtons>

          <IonTitle>{showRead ? "All" : "Unread"}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <ReportFeed fetchFn={fetchFn} />
      </IonContent>
    </IonPage>
  );
}
