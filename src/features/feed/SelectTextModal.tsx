import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonPage,
} from "@ionic/react";
import { useRef } from "react";
import { Centered } from "../auth/Login";

interface SelectTextProps {
  text: string;
  onDismiss: (data?: string | null | undefined | number, role?: string) => void;
}

export default function SelectText({ text, onDismiss }: SelectTextProps) {
  const pageRef = useRef();

  return (
    <IonPage ref={pageRef}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            <Centered>Select Text</Centered>
          </IonTitle>
          <IonButtons slot="end">
            <IonButton
              onClick={() => {
                onDismiss();
              }}
            >
              Dismiss
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <p className="ion-padding-horizontal selectable preserve-newlines">
          {text}
        </p>
      </IonContent>
    </IonPage>
  );
}
