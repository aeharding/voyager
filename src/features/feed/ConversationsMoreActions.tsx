import { IonButton } from "@ionic/react";
import { personCircleOutline } from "ionicons/icons";
import { useParams } from "react-router";

import HeaderEllipsisIcon from "#/features/shared/HeaderEllipsisIcon";
import usePresentUserActions from "#/features/user/usePresentUserActions";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import { useOptimizedIonRouter } from "#/helpers/useOptimizedIonRouter";

export default function ConversationsMoreActions() {
  const { handle } = useParams<{ handle: string }>();
  const presentUserActions = usePresentUserActions();
  const router = useOptimizedIonRouter();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  return (
    <>
      <IonButton
        disabled={!handle}
        onClick={() =>
          presentUserActions(handle, {
            hideMessageButton: true,
            prependButtons: [
              {
                text: handle,
                icon: personCircleOutline,
                handler: () => {
                  router.push(buildGeneralBrowseLink(`/u/${handle}`));
                },
              },
            ],
          })
        }
      >
        <HeaderEllipsisIcon slot="icon-only" />
      </IonButton>
    </>
  );
}
