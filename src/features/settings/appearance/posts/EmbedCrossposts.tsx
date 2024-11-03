import { IonItem, IonToggle } from "@ionic/react";

import { useAppDispatch, useAppSelector } from "#/store";

import { setEmbedCrossposts } from "../../settingsSlice";

export default function EmbedCrossposts() {
  const dispatch = useAppDispatch();
  const embedCrossposts = useAppSelector(
    (state) => state.settings.appearance.posts.embedCrossposts,
  );

  return (
    <IonItem>
      <IonToggle
        checked={embedCrossposts}
        onIonChange={(e) => dispatch(setEmbedCrossposts(e.detail.checked))}
      >
        Embed Crossposts
      </IonToggle>
    </IonItem>
  );
}
