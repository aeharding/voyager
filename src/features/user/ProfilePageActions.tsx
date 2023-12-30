import { IonButton, IonIcon, useIonActionSheet } from "@ionic/react";
import { ellipsisHorizontal, footstepsOutline } from "ionicons/icons";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import { useOptimizedIonRouter } from "../../helpers/useOptimizedIonRouter";
import { useAppSelector } from "../../store";
import { usernameSelector } from "../auth/authSelectors";
import { compact } from "lodash";

export default function ProfilePageActions() {
  const router = useOptimizedIonRouter();
  const username = useAppSelector(usernameSelector);
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const [presentActionSheet] = useIonActionSheet();

  function present() {
    presentActionSheet({
      cssClass: "left-align-buttons",
      buttons: compact([
        username && {
          text: "Mod Log",
          data: "modlog",
          icon: footstepsOutline,
          handler: () => {
            router.push(buildGeneralBrowseLink(`/u/${username}/log`));
          },
        },
        {
          text: "Cancel",
          role: "cancel",
        },
      ]),
    });
  }

  return (
    <IonButton fill="default" onClick={present}>
      <IonIcon icon={ellipsisHorizontal} color="primary" />
    </IonButton>
  );
}
