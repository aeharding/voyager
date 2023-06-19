import { IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import AppContent from "../components/AppContent";

export default function SettingsPage() {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tab 3</IonTitle>
        </IonToolbar>
      </IonHeader>
      <AppContent>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tab 3</IonTitle>
          </IonToolbar>
        </IonHeader>
      </AppContent>
    </IonPage>
  );
}
