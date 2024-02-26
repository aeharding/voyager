import {
  IonBackButton,
  IonButtons,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import AppContent from "../../../features/shared/AppContent";
import Theme from "../../../features/settings/appearance/themes/Theme";
import { useSetActivePage } from "../../../features/auth/AppContext";
import { useRef } from "react";
import AppHeader from "../../../features/shared/AppHeader";

export default function AppearanceThemePage() {
  const pageRef = useRef<HTMLElement>(null);

  useSetActivePage(pageRef);

  return (
    <IonPage ref={pageRef} className="grey-bg">
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/settings" text="Settings" />
          </IonButtons>

          <IonTitle>Theme</IonTitle>
        </IonToolbar>
      </AppHeader>
      <AppContent scrollY>
        <Theme />
      </AppContent>
    </IonPage>
  );
}
