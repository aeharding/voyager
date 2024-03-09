import { IonActionSheet, IonButton } from "@ionic/react";
import { personCircleOutline, removeCircleOutline } from "ionicons/icons";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import { useParams } from "react-router";
import { useUserDetails } from "../user/useUserDetails";
import { useState } from "react";
import { useOptimizedIonRouter } from "../../helpers/useOptimizedIonRouter";
import HeaderEllipsisIcon from "../shared/HeaderEllipsisIcon";

export default function ConversationsMoreActions() {
  const [open, setOpen] = useState(false);

  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const router = useOptimizedIonRouter();

  const { handle } = useParams<{ handle: string }>();
  const { isBlocked, blockOrUnblock } = useUserDetails(handle);

  return (
    <>
      <IonButton disabled={!handle} onClick={() => setOpen(true)}>
        <HeaderEllipsisIcon slot="icon-only" />
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
              blockOrUnblock();
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
