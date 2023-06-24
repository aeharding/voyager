import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import Terms from "./Terms";

interface TermsSheetProps {
  onDismiss: (data?: string, role?: string) => void;
}

export default function TermsSheet({ onDismiss }: TermsSheetProps) {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton color="medium" onClick={() => onDismiss()}>
              Cancel
            </IonButton>
          </IonButtons>
          <IonTitle>Terms</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <Terms />
      </IonContent>
    </IonPage>
  );
}
