import { ActionSheetButton, IonIcon, useIonActionSheet } from "@ionic/react";
import { ellipsisHorizontal } from "ionicons/icons";
import { useCallback, useImperativeHandle } from "react";

import { ActionButton } from "#/features/post/actions/ActionButton";

import styles from "./PrivateMessageMoreActions.module.css";

interface MarkReadMoreActionsHandle {
  present: () => void;
}

interface MarkReadMoreActionsProps {
  markReadAction: ActionSheetButton;

  ref: React.RefObject<MarkReadMoreActionsHandle | undefined>;
}

// Minimal ellipsis menu for notification kinds without their own actions
// (mod actions, subscribed-community posts) — just mark read/unread.
export default function MarkReadMoreActions({
  markReadAction,
  ref,
}: MarkReadMoreActionsProps) {
  const [presentActionSheet] = useIonActionSheet();

  const present = useCallback(() => {
    presentActionSheet({
      cssClass: "left-align-buttons",
      buttons: [markReadAction, { text: "Cancel", role: "cancel" }],
    });
  }, [markReadAction, presentActionSheet]);

  useImperativeHandle(ref, () => ({ present }), [present]);

  return (
    <ActionButton
      aria-label="More options"
      onClick={(e) => {
        e.stopPropagation();
        present();
      }}
    >
      <IonIcon className={styles.icon} icon={ellipsisHorizontal} />
    </ActionButton>
  );
}
