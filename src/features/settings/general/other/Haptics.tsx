import { IonItem, IonToggle } from "@ionic/react";

import { useAppDispatch, useAppSelector } from "../../../../store";
import { setEnableHapticFeedback } from "../../settingsSlice";
import { isNative } from "../../../../helpers/device";

export default function Haptics() {
  const dispatch = useAppDispatch();
  const enableHapticFeedback = useAppSelector(
    (state) => state.settings.general.enableHapticFeedback,
  );

  // Some devices do not support haptics
  if (!isNative() && !("vibrate" in window.navigator)) return;

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
