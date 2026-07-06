import { IonItem, IonToggle } from "@ionic/react";

import { getPlatform } from "#/helpers/device";
import { useAppDispatch, useAppSelector } from "#/store";

import { setEnableHapticFeedback } from "../../settingsSlice";

export default function Haptics() {
  const dispatch = useAppDispatch();
  const enableHapticFeedback = useAppSelector(
    (state) => state.settings.general.enableHapticFeedback,
  );

  // Some devices do not support haptics
  if (getPlatform() !== "capacitor" && !("vibrate" in window.navigator)) return;

  return (
    <IonItem>
      <IonToggle
        checked={enableHapticFeedback}
        onIonChange={(e) => dispatch(setEnableHapticFeedback(e.detail.checked))}
      >
        Haptic Feedback
      </IonToggle>
    </IonItem>
  );
}
