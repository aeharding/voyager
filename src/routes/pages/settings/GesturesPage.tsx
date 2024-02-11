import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import AppContent from "../../../features/shared/AppContent";
import SwipeSettings from "../../../features/settings/gestures/SwipeSettings";
import { useRef } from "react";
import { useSetActivePage } from "../../../features/auth/AppContext";

export default function GesturesPage() {
  const pageRef = useRef<HTMLElement>(null);

  useSetActivePage(pageRef);

  return (
    <IonPage ref={pageRef} className="grey-bg">
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
