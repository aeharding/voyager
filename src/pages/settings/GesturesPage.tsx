import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import AppContent from "../../features/shared/AppContent";
import SwipeSettings from "../../features/settings/gestures/SwipeSettings";

export default function GesturesPage() {
  return (
    <IonPage className="grey-bg">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/settings" text="Settings" />
          </IonButtons>

          <IonTitle>Gestures</IonTitle>
        </IonToolbar>
      </IonHeader>
      <AppContent scrollY>
        <SwipeSettings />
      </AppContent>
    </IonPage>
  );
}
