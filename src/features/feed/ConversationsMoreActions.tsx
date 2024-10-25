import { IonButton } from "@ionic/react";
import { useParams } from "react-router";
import HeaderEllipsisIcon from "../shared/HeaderEllipsisIcon";
import usePresentUserActions from "../user/usePresentUserActions";
import { personCircleOutline } from "ionicons/icons";
import { useOptimizedIonRouter } from "../../helpers/useOptimizedIonRouter";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";

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
