import { IonButton, IonButtons, IonIcon } from "@ionic/react";
import { arrowBackSharp } from "ionicons/icons";
import { useContext } from "react";

import { DynamicDismissableModalContext } from "#/features/shared/DynamicDismissableModal";

import styles from "./AndroidClose.module.css";

export default function AndroidClose() {
  const { dismiss } = useContext(DynamicDismissableModalContext);

  return (
    <IonButtons className={styles.androidIonButtons} slot="start">
      <IonButton onClick={dismiss}>
        <IonIcon icon={arrowBackSharp} slot="icon-only" />
      </IonButton>
    </IonButtons>
  );
}
