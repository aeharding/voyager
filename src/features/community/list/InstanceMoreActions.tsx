import { IonButton, IonIcon, useIonActionSheet } from "@ionic/react";
import { ellipsisHorizontal, tabletPortraitOutline } from "ionicons/icons";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import { useOptimizedIonRouter } from "../../../helpers/useOptimizedIonRouter";

export default function CommunitiesMoreActions() {
  const router = useOptimizedIonRouter();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const [presentActionSheet] = useIonActionSheet();

  function present() {
    presentActionSheet({
      cssClass: "left-align-buttons",
      buttons: [
        {
          text: "Instance Sidebar",
          icon: tabletPortraitOutline,
          handler: () => {
            router.push(buildGeneralBrowseLink("/sidebar"));
          },
        },
        {
          text: "Cancel",
          role: "cancel",
        },
      ],
    });
  }

  return (
    <IonButton fill="default" onClick={present}>
      <IonIcon icon={ellipsisHorizontal} color="primary" />
    </IonButton>
  );
}
