import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import AppContent from "../../../features/shared/AppContent";
import HidingSettings from "../../../features/settings/general/hiding/HidingSettings";
import { useRef } from "react";
import { useSetActivePage } from "../../../features/auth/AppContext";

export default function HidingSettingsPage() {
  const pageRef = useRef<HTMLElement>(null);

  useSetActivePage(pageRef);

  return (
    <IonPage ref={pageRef} className="grey-bg">
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
