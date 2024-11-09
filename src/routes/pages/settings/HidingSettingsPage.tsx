import {
  IonBackButton,
  IonButtons,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useRef } from "react";

import { useSetActivePage } from "#/features/auth/AppContext";
import HidingSettings from "#/features/settings/general/hiding/HidingSettings";
import AppContent from "#/features/shared/AppContent";
import AppHeader from "#/features/shared/AppHeader";

export default function HidingSettingsPage() {
  const pageRef = useRef<HTMLElement>(null);

  useSetActivePage(pageRef);

  return (
    <IonPage ref={pageRef} className="grey-bg">
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/settings/general" text="General" />
          </IonButtons>

          <IonTitle>Marking Read / Hiding</IonTitle>
        </IonToolbar>
      </AppHeader>
      <AppContent scrollY>
        <HidingSettings />
      </AppContent>
    </IonPage>
  );
}
