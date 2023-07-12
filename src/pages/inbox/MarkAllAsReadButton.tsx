import { IonActionSheet, IonButton, IonIcon } from "@ionic/react";
import { useAppDispatch } from "../../store";
import { checkmarkDone } from "ionicons/icons";
import { useState } from "react";
import { markAllRead } from "../../features/inbox/inboxSlice";

export default function MarkAllAsReadButton() {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);

  return (
    <>
      <IonButton onClick={() => setOpen(true)}>
        <IonIcon icon={checkmarkDone} />
      </IonButton>

      <IonActionSheet
        isOpen={open}
        buttons={[
          {
            text: "Mark All Read",
            role: "read",
          },
          {
            text: "Cancel",
            role: "cancel",
          },
        ]}
        onDidDismiss={() => setOpen(false)}
        onWillDismiss={async (e) => {
          if (e.detail.role === "read") {
            dispatch(markAllRead());
          }
        }}
      />
    </>
  );
}
