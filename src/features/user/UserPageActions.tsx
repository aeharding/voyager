import { IonActionSheet, IonButton } from "@ionic/react";
import { mailOutline, removeCircleOutline } from "ionicons/icons";
import { useContext, useState } from "react";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import { PageContext } from "../auth/PageContext";
import { useUserDetails } from "./useUserDetails";
import { useOptimizedIonRouter } from "../../helpers/useOptimizedIonRouter";
import HeaderEllipsisIcon from "../shared/HeaderEllipsisIcon";

interface UserPageActionsProps {
  handle: string;
}

export default function UserPageActions({ handle }: UserPageActionsProps) {
  const [open, setOpen] = useState(false);
  const { presentLoginIfNeeded } = useContext(PageContext);
  const router = useOptimizedIonRouter();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
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
