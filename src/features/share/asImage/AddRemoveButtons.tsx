import { IonButton, IonIcon } from "@ionic/react";
import { addOutline, removeOutline } from "ionicons/icons";

import styles from "./AddRemoveButtons.module.css";

interface AddRemoveButtonsProps {
  onAdd: () => void;
  onRemove: () => void;
  addDisabled?: boolean;
  removeDisabled?: boolean;
}

export default function AddRemoveButtons({
  onAdd,
  onRemove,
  addDisabled,
  removeDisabled,
}: AddRemoveButtonsProps) {
  return (
    <div className={styles.container}>
      <IonButton
        onClick={onRemove}
        disabled={removeDisabled}
        color=" "
        className={styles.button}
      >
        <IonIcon icon={removeOutline} />
      </IonButton>
      <IonButton onClick={onAdd} disabled={addDisabled} color=" ">
        <IonIcon icon={addOutline} />
      </IonButton>
    </div>
  );
}
