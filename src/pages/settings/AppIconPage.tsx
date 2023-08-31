import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import AppContent from "../../features/shared/AppContent";
import AppIcon from "../../features/settings/app-icon/AppIcon";

export default function AppIconPage() {
  return (
    <IonPage className="grey-bg">
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/settings" text="Settings" />
          </IonButtons>

          <IonTitle>App Icon</IonTitle>
        </IonToolbar>
      </IonHeader>
      <AppContent scrollY>
        <AppIcon />
      </AppContent>
    </IonPage>
  );
}
