import {
  IonBackButton,
  IonButtons,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import AppContent from "../../../features/shared/AppContent";
import GeneralSettings from "../../../features/settings/general/GeneralSettings";
import { useRef } from "react";
import { useSetActivePage } from "../../../features/auth/AppContext";
import AppHeader from "../../../features/shared/AppHeader";

export default function GeneralPage() {
  const pageRef = useRef<HTMLElement>(null);

  useSetActivePage(pageRef);

  return (
    <IonPage ref={pageRef} className="grey-bg">
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/settings" text="Settings" />
          </IonButtons>

          <IonTitle>General</IonTitle>
        </IonToolbar>
      </AppHeader>
      <AppContent scrollY>
        <GeneralSettings />
      </AppContent>
    </IonPage>
  );
}
