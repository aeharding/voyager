import { IonButton, useIonActionSheet } from "@ionic/react";
import { eyeOffOutline } from "ionicons/icons";
import useHidePosts from "./useHidePosts";
import HeaderEllipsisIcon from "../shared/HeaderEllipsisIcon";

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
    <IonButton onClick={present}>
      <HeaderEllipsisIcon slot="icon-only" />
    </IonButton>
  );
}
