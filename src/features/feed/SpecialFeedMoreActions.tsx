import { IonButton, IonIcon, useIonActionSheet } from "@ionic/react";
import { ellipsisHorizontal, eyeOffOutline } from "ionicons/icons";
import useHidePosts from "./useHidePosts";

export default function SpecialFeedMoreActions() {
  const [presentActionSheet] = useIonActionSheet();

  const hidePosts = useHidePosts();

  function present() {
    presentActionSheet([
      {
        text: "Hide Read Posts",
        icon: eyeOffOutline,
        handler: () => {
          hidePosts();
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
