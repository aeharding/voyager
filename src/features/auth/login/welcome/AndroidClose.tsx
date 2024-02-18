import { styled } from "@linaria/react";
import { IonButton, IonButtons } from "@ionic/react";
import { useContext } from "react";
import { DynamicDismissableModalContext } from "../../../shared/DynamicDismissableModal";

const AndroidIonButtons = styled(IonButtons)`
  .ios & {
    display: none;
  }
`;

export default function AndroidClose() {
  const { dismiss } = useContext(DynamicDismissableModalContext);

  return (
    <AndroidIonButtons slot="end">
      <IonButton onClick={dismiss}>Close</IonButton>
    </AndroidIonButtons>
  );
}
