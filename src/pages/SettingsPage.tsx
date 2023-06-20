import {
  IonBadge,
  IonHeader,
  IonIcon,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import AppContent from "../components/AppContent";
import { InsetIonItem, SettingLabel } from "../features/profile/Profile";
import { apps } from "ionicons/icons";
import { isInstalled } from "../helpers/device";

export default function SettingsPage() {
  return (
    <IonPage className="grey-bg">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <AppContent>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Settings</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonList inset color="primary">
          <InsetIonItem routerLink="/settings/install">
            <IonIcon icon={apps} color="primary" />
            <SettingLabel>Install app</SettingLabel>
            {!isInstalled() && <IonBadge color="danger">1</IonBadge>}
          </InsetIonItem>
        </IonList>
      </AppContent>
    </IonPage>
  );
}
