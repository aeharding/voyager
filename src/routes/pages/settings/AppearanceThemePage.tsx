import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import AppContent from "../../../features/shared/AppContent";
import Theme from "../../../features/settings/appearance/themes/Theme";
import { useSetActivePage } from "../../../features/auth/AppContext";
import { useRef } from "react";

export default function AppearanceThemePage() {
  const pageRef = useRef<HTMLElement>(null);

  useSetActivePage(pageRef);

  return (
    <IonPage ref={pageRef} className="grey-bg">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/settings" text="Settings" />
          </IonButtons>

          <IonTitle>Theme</IonTitle>
        </IonToolbar>
      </IonHeader>
      <AppContent scrollY>
        <Theme />
      </AppContent>
    </IonPage>
  );
}
