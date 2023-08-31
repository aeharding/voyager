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

export default function TermsPage() {
  return (
    <IonPage className="grey-bg">
      <IonHeader translucent>
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
