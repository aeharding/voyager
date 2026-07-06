import { IonItem, IonToggle } from "@ionic/react";

import { useAppDispatch, useAppSelector } from "#/store";

import { setSystemWindowFrame } from "../../settingsSlice";

export default function SystemTitlebar() {
  const dispatch = useAppDispatch();
  const systemWindowFrame = useAppSelector(
    (state) => state.settings.appearance.general.systemWindowFrame,
  );

  return (
    <IonItem>
      <IonToggle
        checked={systemWindowFrame}
        onIonChange={(e) => dispatch(setSystemWindowFrame(e.detail.checked))}
      >
        Use System Titlebar
      </IonToggle>
    </IonItem>
  );
}
