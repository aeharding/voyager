import { IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import AppContent from "../components/AppContent";

export default function SettingsPage() {
  return (
    <IonPage>
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
        <div className="ion-padding">No settings yet. Check back later!</div>
      </AppContent>
    </IonPage>
  );
}
