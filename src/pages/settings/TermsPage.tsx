import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import AppContent from "../../features/shared/AppContent";
import Terms from "../../features/settings/terms/Terms";
import { useRef } from "react";
import { useSetActivePage } from "../../features/auth/AppContext";

export default function TermsPage() {
  const pageRef = useRef<HTMLElement>(null);

  useSetActivePage(pageRef);

  return (
    <IonPage ref={pageRef} className="grey-bg">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/settings" text="Settings" />
          </IonButtons>

          <IonTitle>Terms</IonTitle>
        </IonToolbar>
      </IonHeader>
      <AppContent scrollY>
        <Terms />
      </AppContent>
    </IonPage>
  );
}
