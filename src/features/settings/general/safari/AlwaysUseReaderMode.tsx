import { IonItem, IonToggle } from "@ionic/react";

import { useAppDispatch, useAppSelector } from "#/store";

import { setAlwaysUseReaderMode } from "../../settingsSlice";

export default function AlwaysUseReaderMode() {
  const dispatch = useAppDispatch();
  const alwaysUseReaderMode = useAppSelector(
    (state) => state.settings.general.safari.alwaysUseReaderMode,
  );

  return (
    <IonItem>
      <IonToggle
        checked={alwaysUseReaderMode}
        onIonChange={(e) => dispatch(setAlwaysUseReaderMode(e.detail.checked))}
      >
        Always Use Reader Mode
      </IonToggle>
    </IonItem>
  );
}
