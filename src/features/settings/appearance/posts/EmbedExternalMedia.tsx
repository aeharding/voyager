import { IonItem, IonToggle } from "@ionic/react";

import { useAppDispatch, useAppSelector } from "../../../../store";
import { setEmbedExternalMedia } from "../../settingsSlice";
import { resetRedgifs } from "../../../media/external/redgifs/redgifsSlice";
import { platformSupportsRedgif } from "../../../media/external/redgifs/helpers";

export default function EmbedExternalMedia() {
  const dispatch = useAppDispatch();
  const embedExternalMedia = useAppSelector(
    (state) => state.settings.appearance.posts.embedExternalMedia,
  );

  if (!platformSupportsRedgif()) return;

  return (
    <IonItem>
      <IonToggle
        checked={embedExternalMedia}
        onIonChange={(e) => {
          if (!e.detail.checked) dispatch(resetRedgifs());

          dispatch(setEmbedExternalMedia(e.detail.checked));
        }}
      >
        Embed External Media
      </IonToggle>
    </IonItem>
  );
}
