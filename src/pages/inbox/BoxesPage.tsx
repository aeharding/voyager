import {
  IonBadge,
  IonHeader,
  IonIcon,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter,
} from "@ionic/react";
import {
  albumsOutline,
  albumsSharp,
  chatbubble,
  chatbubbleOutline,
  ellipseOutline,
  fileTray,
  mail,
  mailOutline,
  personCircleOutline,
} from "ionicons/icons";
import { MouseEvent, useContext } from "react";
import { PageContext } from "../../features/auth/PageContext";
import { isModeratorSelector } from "../../features/auth/authSlice";
import { getInboxCounts } from "../../features/inbox/inboxSlice";
import AppContent from "../../features/shared/AppContent";
import { InsetIonItem, SettingLabel } from "../../features/user/Profile";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  getReportCounts,
  reportCountSelector,
} from "../../features/report/reportSlice";

export default function BoxesPage() {
  const dispatch = useAppDispatch();
  const isModerator = useAppSelector(isModeratorSelector);
  const {
    post_reports,
    private_message_reports = 0,
    comment_reports,
  } = useAppSelector(reportCountSelector);

  const { presentLoginIfNeeded } = useContext(PageContext);

  useIonViewWillEnter(() => {
    dispatch(getInboxCounts());
    dispatch(getReportCounts());
  });

  function interceptIfLoggedOut(e: MouseEvent) {
    if (presentLoginIfNeeded()) e.preventDefault();
  }

  return (
    <IonPage className="grey-bg">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Boxes</IonTitle>
        </IonToolbar>
      </IonHeader>
      <AppContent scrollY>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Boxes</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonList inset color="primary">
          <InsetIonItem routerLink="/inbox/all" onClick={interceptIfLoggedOut}>
            <IonIcon icon={fileTray} color="primary" />
            <SettingLabel>Inbox (All)</SettingLabel>
          </InsetIonItem>
          <InsetIonItem
            routerLink="/inbox/unread"
            onClick={interceptIfLoggedOut}
          >
            <IonIcon icon={ellipseOutline} color="primary" />
            <SettingLabel>Unread</SettingLabel>
          </InsetIonItem>
        </IonList>

        <IonList inset color="primary">
          <InsetIonItem
            routerLink="/inbox/post-replies"
            onClick={interceptIfLoggedOut}
          >
            <IonIcon icon={albumsOutline} color="primary" />
            <SettingLabel>Post Replies</SettingLabel>
          </InsetIonItem>
          <InsetIonItem
            routerLink="/inbox/comment-replies"
            onClick={interceptIfLoggedOut}
          >
            <IonIcon icon={chatbubbleOutline} color="primary" />
            <SettingLabel>Comment Replies</SettingLabel>
          </InsetIonItem>
          <InsetIonItem
            routerLink="/inbox/mentions"
            onClick={interceptIfLoggedOut}
          >
            <IonIcon icon={personCircleOutline} color="primary" />
            <SettingLabel>Mentions</SettingLabel>
          </InsetIonItem>
        </IonList>

        <IonList inset color="primary">
          <InsetIonItem
            routerLink="/inbox/messages"
            onClick={interceptIfLoggedOut}
          >
            <IonIcon icon={mailOutline} color="primary" />
            <SettingLabel>Messages</SettingLabel>
          </InsetIonItem>
        </IonList>

        {isModerator ? (
          <IonList inset color="primary">
            <InsetIonItem routerLink="/reports/posts">
              <IonIcon icon={albumsSharp} color="primary" />
              <SettingLabel>Post Reports</SettingLabel>
              {post_reports ? (
                <IonBadge color="danger">{post_reports}</IonBadge>
              ) : undefined}
            </InsetIonItem>
            <InsetIonItem routerLink="/reports/comments">
              <IonIcon icon={chatbubble} color="primary" />
              <SettingLabel>Comment Reports</SettingLabel>
              {comment_reports ? (
                <IonBadge color="danger">{comment_reports}</IonBadge>
              ) : undefined}
            </InsetIonItem>
            <InsetIonItem routerLink="/reports/private_messages">
              <IonIcon icon={mail} color="primary" />
              <SettingLabel>Message Reports</SettingLabel>
              {private_message_reports ? (
                <IonBadge color="danger">{private_message_reports}</IonBadge>
              ) : undefined}
            </InsetIonItem>
          </IonList>
        ) : undefined}
      </AppContent>
    </IonPage>
  );
}
