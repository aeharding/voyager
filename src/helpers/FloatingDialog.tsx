import { IonIcon } from "@ionic/react";
import { close } from "ionicons/icons";

import styles from "./FloatingDialog.module.css";

interface FloatingDialogProps extends React.PropsWithChildren {
  onDismiss: () => void;
}

export default function FloatingDialog({
  onDismiss,
  children,
}: FloatingDialogProps) {
  return (
    <div className={styles.container}>
      <button className={styles.closeButton} onClick={() => onDismiss()}>
        <IonIcon icon={close} />
      </button>
      {children}
    </div>
  );
}
