import { IonActionSheet, IonButton, IonIcon, useIonRouter } from "@ionic/react";
import { ellipsisHorizontal, mail } from "ionicons/icons";
import { useState } from "react";

interface UserPageActionsProps {
  handle: string;
}

export default function UserPageActions({ handle }: UserPageActionsProps) {
  const [open, setOpen] = useState(false);
  const router = useIonRouter();
  const tab = location.pathname.split("/")[1];

  return (
    <>
      <IonButton
        disabled={!handle}
        fill="default"
        onClick={() => setOpen(true)}
      >
        <IonIcon icon={ellipsisHorizontal} color="primary" />
      </IonButton>
      <IonActionSheet
        cssClass="left-align-buttons"
        isOpen={open}
        buttons={[
          {
            text: "Send Message",
            role: "message",
            icon: mail,
          },
          {
            text: "Cancel",
            role: "cancel",
          },
        ]}
        onWillDismiss={async (e) => {
          setOpen(false);

          switch (e.detail.role) {
            case "message": {
              router.push(
                `/${tab === "posts" ? "posts/other" : tab}/messages/${handle}`
              );
              break;
            }
            default: {
              break;
            }
          }
        }}
      />
    </>
  );
}
