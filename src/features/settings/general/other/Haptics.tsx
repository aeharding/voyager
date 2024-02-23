import { IonToggle } from "@ionic/react";
import { InsetIonItem } from "../../../../routes/pages/profile/ProfileFeedItemsPage";
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
    <InsetIonItem>
      <IonToggle
        checked={enableHapticFeedback}
        onIonChange={(e) => dispatch(setEnableHapticFeedback(e.detail.checked))}
      >
        Haptic Feedback
      </IonToggle>
    </InsetIonItem>
  );
}
