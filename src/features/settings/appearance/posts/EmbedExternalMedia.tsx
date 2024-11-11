import { IonItem, IonToggle } from "@ionic/react";

import { platformSupportsRedgif } from "#/features/media/external/redgifs/helpers";
import { resetRedgifs } from "#/features/media/external/redgifs/redgifsSlice";
import { useAppDispatch, useAppSelector } from "#/store";

import { setEmbedExternalMedia } from "../../settingsSlice";

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
