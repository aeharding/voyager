import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import AppContent from "../../features/shared/AppContent";
import HidingSettings from "../../features/settings/general/hiding/HidingSettings";

export default function HidingSettingsPage() {
  return (
    <IonPage className="grey-bg">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/settings/general" text="General" />
          </IonButtons>

          <IonTitle>Marking Read / Hiding</IonTitle>
        </IonToolbar>
      </IonHeader>
      <AppContent scrollY>
        <HidingSettings />
      </AppContent>
    </IonPage>
  );
}
