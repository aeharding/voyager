import { ActionSheetButton, IonIcon, useIonActionSheet } from "@ionic/react";
import { ellipsisHorizontal } from "ionicons/icons";
import { useCallback, useImperativeHandle } from "react";

import styles from "./PrivateMessageMoreActions.module.css";

interface ModActionMoreActionsHandle {
  present: () => void;
}

interface ModActionMoreActionsProps {
  markReadAction: ActionSheetButton;

  ref: React.RefObject<ModActionMoreActionsHandle | undefined>;
}

export default function ModActionMoreActions({
  markReadAction,
  ref,
}: ModActionMoreActionsProps) {
  const [presentActionSheet] = useIonActionSheet();

  const present = useCallback(() => {
    presentActionSheet({
      cssClass: "left-align-buttons",
      buttons: [markReadAction, { text: "Cancel", role: "cancel" }],
    });
  }, [markReadAction, presentActionSheet]);

  useImperativeHandle(ref, () => ({ present }), [present]);

  return (
    <IonIcon
      className={styles.icon}
      icon={ellipsisHorizontal}
      onClick={(e) => {
        e.stopPropagation();
        present();
      }}
    />
  );
}
