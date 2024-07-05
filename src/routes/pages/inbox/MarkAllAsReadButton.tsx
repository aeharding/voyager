import { IonButton, IonIcon, useIonActionSheet } from "@ionic/react";
import { useAppDispatch } from "../../../store";
import { checkmarkDone } from "ionicons/icons";
import { markAllRead } from "../../../features/inbox/inboxSlice";

export default function MarkAllAsReadButton() {
  const dispatch = useAppDispatch();
  const [presentActionSheet] = useIonActionSheet();

  return (
    <IonButton
      onClick={() => {
        presentActionSheet({
          buttons: [
            {
              text: "Mark All Read",
              role: "read",
              handler: () => {
                dispatch(markAllRead());
              },
            },
            {
              text: "Cancel",
              role: "cancel",
            },
          ],
        });
      }}
    >
      <IonIcon icon={checkmarkDone} />
    </IonButton>
  );
}
