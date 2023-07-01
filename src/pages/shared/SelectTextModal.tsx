import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonModal,
} from "@ionic/react";
import { useContext } from "react";
import { Centered } from "../../features/auth/Login";
import styled from "@emotion/styled";
import { PageContext } from "../../features/auth/PageContext";

interface SelectTextProps {
  text: string;
  isOpen: boolean;
  onDismiss: (data?: string | null | undefined | number, role?: string) => void;
}

const SelectableText = styled.p`
  user-select: text;
  -webkit-user-select: text;
  white-space: pre-wrap;
`;

export default function SelectText(props: SelectTextProps) {
  const pageContext = useContext(PageContext);

  return (
    <IonModal
      isOpen={props.isOpen}
      canDismiss={async (_, role?: string) => {
        return role !== "gesture";
      }}
      presentingElement={pageContext.page}
    >
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            <Centered>Select Text</Centered>
          </IonTitle>
          <IonButtons slot="end">
            <IonButton
              onClick={() => {
                props.onDismiss();
              }}
            >
              Dismiss
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <SelectableText className="ion-padding-horizontal">
          {props.text}
        </SelectableText>
      </IonContent>
    </IonModal>
  );
}
