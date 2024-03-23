import {
  IonBackButton,
  IonButtons,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import AppContent from "../../../features/shared/AppContent";
import { useSetActivePage } from "../../../features/auth/AppContext";
import { useRef } from "react";
import BiometricTitle from "../../../features/settings/biometric/BiometricTitle";
import BiometricSettings from "../../../features/settings/biometric/BiometricSettings";
import AppHeader from "../../../features/shared/AppHeader";

export default function BiometricPage() {
  const pageRef = useRef<HTMLElement>(null);

  useSetActivePage(pageRef);

  return (
    <IonPage className="grey-bg" ref={pageRef}>
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton text="Settings" defaultHref="/settings" />
          </IonButtons>

          <IonTitle>
            <BiometricTitle />
          </IonTitle>
        </IonToolbar>
      </AppHeader>
      <AppContent scrollY fullscreen>
        <BiometricSettings />
      </AppContent>
    </IonPage>
  );
}
