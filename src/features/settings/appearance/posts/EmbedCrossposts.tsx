import { useAppDispatch, useAppSelector } from "../../../../store";
import { setEmbedCrossposts } from "../../settingsSlice";
import { InsetIonItem } from "../../shared/formatting";
import { IonToggle } from "@ionic/react";

export default function EmbedCrossposts() {
  const dispatch = useAppDispatch();
  const embedCrossposts = useAppSelector(
    (state) => state.settings.appearance.posts.embedCrossposts,
  );

  return (
    <InsetIonItem>
      <IonToggle
        checked={embedCrossposts}
        onIonChange={(e) => dispatch(setEmbedCrossposts(e.detail.checked))}
      >
        Embed Crossposts
      </IonToggle>
    </InsetIonItem>
  );
}
