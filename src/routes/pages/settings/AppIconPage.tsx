import {
  IonBackButton,
  IonButtons,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import AppContent from "../../../features/shared/AppContent";
import AppIcon from "../../../features/settings/app-icon/AppIcon";
import { useRef } from "react";
import { useSetActivePage } from "../../../features/auth/AppContext";
import AppHeader from "../../../features/shared/AppHeader";

export default function AppIconPage() {
  const pageRef = useRef<HTMLElement>(null);

  useSetActivePage(pageRef);

  return (
    <IonPage ref={pageRef} className="grey-bg">
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/settings" text="Settings" />
          </IonButtons>

          <IonTitle>App Icon</IonTitle>
        </IonToolbar>
      </AppHeader>
      <AppContent scrollY>
        <AppIcon />
      </AppContent>
    </IonPage>
  );
}
