import StarterPacksModal from "#/features/feed/empty/home/StarterPacksModal";
import { IonButton, useIonActionSheet, useIonModal } from "@ionic/react";
import { duplicateOutline, tabletPortraitOutline } from "ionicons/icons";
import { use } from "react";

import { PageContext } from "#/features/auth/PageContext";
import HeaderEllipsisIcon from "#/features/shared/HeaderEllipsisIcon";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import { useOptimizedIonRouter } from "#/helpers/useOptimizedIonRouter";

export default function CommunitiesMoreActions() {
  const router = useOptimizedIonRouter();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const [presentActionSheet] = useIonActionSheet();

  const { pageRef } = use(PageContext);
  const [presentStarterPacksModal, onDismissStarterPacks] = useIonModal(
    StarterPacksModal,
    {
      onDismiss: () => onDismissStarterPacks(),
    },
  );

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
          text: "Starter Community Packs",
          icon: duplicateOutline,
          handler: () => {
            presentStarterPacksModal({
              presentingElement:
                pageRef?.current?.closest("ion-tabs") ?? undefined,
            });
          },
        },
        { text: "Cancel", role: "cancel" },
      ],
    });
  }

  return (
    <IonButton onClick={present}>
      <HeaderEllipsisIcon slot="icon-only" />
    </IonButton>
  );
}
