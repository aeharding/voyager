import {
  IonBackButton,
  IonButtons,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useRef } from "react";

import { useSetActivePage } from "#/features/auth/AppContext";
import AppearanceSettings from "#/features/settings/appearance/AppearanceSettings";
import AppContent from "#/features/shared/AppContent";
import AppHeader from "#/features/shared/AppHeader";

export default function AppearancePage() {
  const pageRef = useRef<HTMLElement>(null);

  useSetActivePage(pageRef);

  return (
    <IonPage ref={pageRef} className="grey-bg">
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/settings" text="Settings" />
          </IonButtons>

          <IonTitle>Appearance</IonTitle>
        </IonToolbar>
      </AppHeader>
      <AppContent scrollY>
        <AppearanceSettings />
      </AppContent>
    </IonPage>
  );
}
