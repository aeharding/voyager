import { IonItem, IonToggle } from "@ionic/react";

import { useAppDispatch, useAppSelector } from "#/store";

import { setShowSystemTitlebar } from "../../settingsSlice";

export default function ShowSystemTitlebar() {
  const dispatch = useAppDispatch();
  const showSystemTitlebar = useAppSelector(
    (state) => state.settings.appearance.general.showSystemTitlebar,
  );

  return (
    <IonItem>
      <IonToggle
        checked={showSystemTitlebar}
        onIonChange={(e) => dispatch(setShowSystemTitlebar(e.detail.checked))}
      >
        Show System Titlebar
      </IonToggle>
    </IonItem>
  );
}
