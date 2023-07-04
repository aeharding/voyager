import {
  IonHeader,
  IonIcon,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter,
} from "@ionic/react";
import AppContent from "../../features/shared/AppContent";
import { InsetIonItem, SettingLabel } from "../../features/user/Profile";
import {
  albumsOutline,
  chatbubbleOutline,
  ellipseOutline,
  fileTray,
  mail,
  personCircleOutline,
} from "ionicons/icons";
import { useAppDispatch } from "../../store";
import { getInboxCounts } from "../../features/inbox/inboxSlice";
import { MouseEvent, useContext } from "react";
import { PageContext } from "../../features/auth/PageContext";

export default function BoxesPage() {
  const dispatch = useAppDispatch();

  const { presentLoginIfNeeded } = useContext(PageContext);

  useIonViewWillEnter(() => {
    dispatch(getInboxCounts());
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
            <IonIcon icon={mail} color="primary" />
            <SettingLabel>Messages</SettingLabel>
          </InsetIonItem>
        </IonList>
      </AppContent>
    </IonPage>
  );
}
