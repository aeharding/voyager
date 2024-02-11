import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import AppContent from "../../../features/shared/AppContent";
import { useSetActivePage } from "../../../features/auth/AppContext";
import { useRef } from "react";
import BiometricTitle from "../../../features/settings/biometric/BiometricTitle";
import BiometricSettings from "../../../features/settings/biometric/BiometricSettings";

export default function BiometricPage() {
  const pageRef = useRef<HTMLElement>(null);

  useSetActivePage(pageRef);

  return (
    <IonPage className="grey-bg" ref={pageRef}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton text="Settings" defaultHref="/settings" />
          </IonButtons>

          <IonTitle>
            <BiometricTitle />
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <AppContent scrollY fullscreen>
        <BiometricSettings />
      </AppContent>
    </IonPage>
  );
}
