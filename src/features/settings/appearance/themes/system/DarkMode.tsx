import { IonItem, IonToggle } from "@ionic/react";

import { useAppDispatch, useAppSelector } from "#/store";

import { setUseSystemDarkMode } from "../../../settingsSlice";

export default function DarkMode() {
  const dispatch = useAppDispatch();
  const { usingSystemDarkMode } = useAppSelector(
    (state) => state.settings.appearance.dark,
  );

  return (
    <IonItem>
      <IonToggle
        checked={usingSystemDarkMode}
        onIonChange={(e) => dispatch(setUseSystemDarkMode(e.detail.checked))}
      >
        Use System Light/Dark Mode
      </IonToggle>
    </IonItem>
  );
}
