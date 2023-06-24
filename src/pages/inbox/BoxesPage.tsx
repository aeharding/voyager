import {
  IonHeader,
  IonIcon,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
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

export default function BoxesPage() {
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
          <InsetIonItem routerLink="/inbox/all">
            <IonIcon icon={fileTray} color="primary" />
            <SettingLabel>Inbox (All)</SettingLabel>
          </InsetIonItem>
          <InsetIonItem routerLink="/inbox/unread">
            <IonIcon icon={ellipseOutline} color="primary" />
            <SettingLabel>Unread</SettingLabel>
          </InsetIonItem>
        </IonList>

        <IonList inset color="primary">
          <InsetIonItem routerLink="/inbox/post-replies">
            <IonIcon icon={albumsOutline} color="primary" />
            <SettingLabel>Post Replies</SettingLabel>
          </InsetIonItem>
          <InsetIonItem routerLink="/inbox/comment-replies">
            <IonIcon icon={chatbubbleOutline} color="primary" />
            <SettingLabel>Comment Replies</SettingLabel>
          </InsetIonItem>
          <InsetIonItem routerLink="/inbox/mentions">
            <IonIcon icon={personCircleOutline} color="primary" />
            <SettingLabel>Mentions</SettingLabel>
          </InsetIonItem>
        </IonList>

        <IonList inset color="primary">
          <InsetIonItem routerLink="/inbox/messages">
            <IonIcon icon={mail} color="primary" />
            <SettingLabel>Messages</SettingLabel>
          </InsetIonItem>
        </IonList>
      </AppContent>
    </IonPage>
  );
}
