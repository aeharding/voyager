import { IonActionSheet, IonButton, IonIcon, useIonRouter } from "@ionic/react";
import { ellipsisHorizontal, mail } from "ionicons/icons";
import { useState } from "react";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";

interface UserPageActionsProps {
  handle: string;
}

export default function UserPageActions({ handle }: UserPageActionsProps) {
  const [open, setOpen] = useState(false);
  const router = useIonRouter();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

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
              router.push(buildGeneralBrowseLink(`/u/${handle}/message`));
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
