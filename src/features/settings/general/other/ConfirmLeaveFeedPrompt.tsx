import { IonItem, IonToggle } from "@ionic/react";

import { getPlatform, isAndroid } from "#/helpers/device";
import { useAppDispatch, useAppSelector } from "#/store";

import { setConfirmLeaveFeedPrompt } from "../../settingsSlice";

export const canConfigureConfirmLeaveFeedPrompt =
  isAndroid() && getPlatform() === "capacitor";

export default function ConfirmLeaveFeedPrompt() {
  const dispatch = useAppDispatch();
  const confirmLeaveFeedPrompt = useAppSelector(
    (state) => state.settings.general.confirmLeaveFeedPrompt,
  );

  if (!canConfigureConfirmLeaveFeedPrompt) return;

  return (
    <IonItem>
      <IonToggle
        checked={confirmLeaveFeedPrompt}
        onIonChange={(e) =>
          dispatch(setConfirmLeaveFeedPrompt(e.detail.checked))
        }
      >
        Confirm Back from Home/All/Local
      </IonToggle>
    </IonItem>
  );
}
