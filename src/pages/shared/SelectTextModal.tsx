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
import { Centered } from "../../features/auth/Login";
import styled from "@emotion/styled";

interface SelectTextProps {
  text: string;
  onDismiss: (data?: string | null | undefined | number, role?: string) => void;
}

const SelectableText = styled.p`
  user-select: text;
  -webkit-user-select: text;
  white-space: pre-wrap;
`;

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
        <SelectableText>{text}</SelectableText>
      </IonContent>
    </IonPage>
  );
}
