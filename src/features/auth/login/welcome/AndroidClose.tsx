import { IonButton, IonButtons, IonIcon } from "@ionic/react";
import { styled } from "@linaria/react";
import { arrowBackSharp } from "ionicons/icons";
import { useContext } from "react";

import { DynamicDismissableModalContext } from "#/features/shared/DynamicDismissableModal";

const AndroidIonButtons = styled(IonButtons)`
  .ios & {
    display: none;
  }
`;

export default function AndroidClose() {
  const { dismiss } = useContext(DynamicDismissableModalContext);

  return (
    <AndroidIonButtons slot="start">
      <IonButton onClick={dismiss}>
        <IonIcon icon={arrowBackSharp} slot="icon-only" />
      </IonButton>
    </AndroidIonButtons>
  );
}
