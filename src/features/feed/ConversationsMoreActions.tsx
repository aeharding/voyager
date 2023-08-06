import {
  IonButton,
  IonIcon,
  useIonActionSheet,
  useIonRouter,
} from "@ionic/react";
import {
  ellipsisHorizontal,
  personCircleOutline,
  removeCircleOutline,
} from "ionicons/icons";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import { useParams } from "react-router";
import { useUserDetails } from "../user/useUserDetails";

export default function ConversationsMoreActions() {
  const [presentActionSheet] = useIonActionSheet();

  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const router = useIonRouter();

  const { handle } = useParams<{ handle: string }>();
  const { isBlocked, blockOrUnblock } = useUserDetails(handle);

  function present() {
    presentActionSheet([
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
    ]);
  }

  return (
    <IonButton fill="default" onClick={present}>
      <IonIcon icon={ellipsisHorizontal} color="primary" />
    </IonButton>
  );
}
