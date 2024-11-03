import {
  IonBackButton,
  IonButtons,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useRef } from "react";

import { useSetActivePage } from "#/features/auth/AppContext";
import SelectDeviceMode from "#/features/settings/appearance/themes/system/SelectDeviceMode";
import AppContent from "#/features/shared/AppContent";
import AppHeader from "#/features/shared/AppHeader";

export default function DeviceModeSettingsPage() {
  const pageRef = useRef<HTMLElement>(null);

  useSetActivePage(pageRef);

  return (
    <IonPage ref={pageRef} className="grey-bg">
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton
              defaultHref="/settings/appearance/theme"
              text="Theme"
            />
          </IonButtons>

          <IonTitle>Device Mode</IonTitle>
        </IonToolbar>
      </AppHeader>
      <AppContent scrollY>
        <SelectDeviceMode />
      </AppContent>
    </IonPage>
  );
}
