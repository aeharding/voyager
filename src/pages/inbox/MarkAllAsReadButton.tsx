import { IonActionSheet, IonButton } from "@ionic/react";
import { useAppDispatch } from "../../store";
import { checkmarkDone } from "ionicons/icons";
import { useState } from "react";
import { markAllRead } from "../../features/inbox/inboxSlice";
import IonIconWrapper from "../../helpers/ionIconWrapper";

export default function MarkAllAsReadButton() {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);

  return (
    <>
      <IonButton onClick={() => setOpen(true)}>
        <IonIconWrapper icon={checkmarkDone} />
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
        onWillDismiss={async (e) => {
          setOpen(false);

          if (e.detail.role === "read") {
            dispatch(markAllRead());
          }
        }}
      />
    </>
  );
}
