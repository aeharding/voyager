import { IonItem, IonToggle } from "@ionic/react";

import { useAppDispatch, useAppSelector } from "#/store";

import { setThumbnailinatorEnabled } from "../../settingsSlice";

export default function Thumbnailinator() {
  const dispatch = useAppDispatch();
  const thumbnailinatorEnabled = useAppSelector(
    (state) => state.settings.general.thumbnailinatorEnabled,
  );

  return (
    <IonItem>
      <IonToggle
        checked={thumbnailinatorEnabled}
        onIonChange={(e) =>
          dispatch(setThumbnailinatorEnabled(e.detail.checked))
        }
      >
        Find Thumbnails When Missing
      </IonToggle>
    </IonItem>
  );
}
