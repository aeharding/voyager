import { IonButton, IonButtons, IonIcon } from "@ionic/react";
import { arrowBackSharp } from "ionicons/icons";
import { use } from "react";

import { DynamicDismissableModalContext } from "#/features/shared/DynamicDismissableModal";

import styles from "./AndroidClose.module.css";

export default function AndroidClose() {
  const { dismiss } = use(DynamicDismissableModalContext);

  return (
    <IonButtons className={styles.androidIonButtons} slot="start">
      <IonButton onClick={dismiss}>
        <IonIcon icon={arrowBackSharp} slot="icon-only" />
      </IonButton>
    </IonButtons>
  );
}
