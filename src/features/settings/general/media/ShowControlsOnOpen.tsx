import { IonItem, IonToggle } from "@ionic/react";

import { useAppDispatch, useAppSelector } from "#/store";

import { setShowControlsOnOpen } from "../../settingsSlice";

export default function ShowControlsOnOpen() {
  const dispatch = useAppDispatch();
  const showControlsOnOpen = useAppSelector(
    (state) => state.settings.general.media.showControlsOnOpen,
  );

  return (
    <IonItem>
      <IonToggle
        checked={showControlsOnOpen}
        onIonChange={(e) => dispatch(setShowControlsOnOpen(e.detail.checked))}
      >
        Show Controls When Opened
      </IonToggle>
    </IonItem>
  );
}
