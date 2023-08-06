import { IonActionSheet, IonButton, IonIcon, useIonRouter } from "@ionic/react";
import {
  ellipsisHorizontal,
  personCircleOutline,
  removeCircleOutline,
} from "ionicons/icons";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import { useParams } from "react-router";
import { useUserDetails } from "../user/useUserDetails";
import { useState } from "react";

export default function ConversationsMoreActions() {
  const [open, setOpen] = useState(false);

  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const router = useIonRouter();

  const { handle } = useParams<{ handle: string }>();
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
            text: handle,
            icon: personCircleOutline,
            handler: () => {
              router.push(buildGeneralBrowseLink(`/u/${handle}`));
            },
          },
          {
            text: !isBlocked ? "Block User" : "Unblock User",
            data: "block",
            role: !isBlocked ? "destructive" : undefined,
            icon: removeCircleOutline,
            handler: async () => {
              await blockOrUnblock();
            },
          },
          {
            text: "Cancel",
            role: "cancel",
          },
        ]}
        onDidDismiss={() => setOpen(false)}
      />
    </>
  );
}
