import { IonActionSheet, IonButton, IonIcon, useIonRouter } from "@ionic/react";
import {
  ellipsisHorizontal,
  mailOutline,
  removeCircleOutline,
} from "ionicons/icons";
import { useState } from "react";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import { usePageContext } from "../auth/PageContext";
import { useUserDetails } from "./useUserDetails";

interface UserPageActionsProps {
  handle: string;
}

export default function UserPageActions({ handle }: UserPageActionsProps) {
  const [open, setOpen] = useState(false);
  const { presentLoginIfNeeded } = usePageContext();
  const router = useIonRouter();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const { isBlocked, blockOrUnblock } = useUserDetails(handle);

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
            data: "message",
            icon: mailOutline,
          },
          {
            text: !isBlocked ? "Block User" : "Unblock User",
            data: "block",
            role: !isBlocked ? "destructive" : undefined,
            icon: removeCircleOutline,
          },
          {
            text: "Cancel",
            role: "cancel",
          },
        ]}
        onDidDismiss={() => setOpen(false)}
        onWillDismiss={async (e) => {
          switch (e.detail.data) {
            case "message": {
              if (presentLoginIfNeeded()) return;

              router.push(buildGeneralBrowseLink(`/u/${handle}/message`));
              break;
            }
            case "block": {
              blockOrUnblock();
            }
          }
        }}
      />
    </>
  );
}
