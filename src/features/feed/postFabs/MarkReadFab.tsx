import { IonFab, IonFabButton, IonIcon } from "@ionic/react";
import { eyeOffOutline } from "ionicons/icons";
import useHidePosts from "../useHidePosts";

export default function MarkReadFab() {
  const hidePosts = useHidePosts();

  return (
    <IonFab slot="fixed" vertical="bottom" horizontal="end">
      <IonFabButton onClick={hidePosts}>
        <IonIcon icon={eyeOffOutline} />
      </IonFabButton>
    </IonFab>
  );
}
