import { IonItem, IonLabel, IonList, IonToggle } from "@ionic/react";

import { HelperText, ListHeader } from "#/features/settings/shared/formatting";
import { useAppDispatch, useAppSelector } from "#/store";

import { setQuickSwitchDarkMode } from "../../../settingsSlice";

export default function QuickSwitchDarkMode() {
  const dispatch = useAppDispatch();
  const quickSwitch = useAppSelector(
    (state) => state.settings.appearance.dark.quickSwitch,
  );

  return (
    <>
      <ListHeader>
        <IonLabel>Quick Switch</IonLabel>
      </ListHeader>
      <IonList inset>
        <IonItem>
          <IonToggle
            checked={quickSwitch}
            onIonChange={(e) =>
              dispatch(setQuickSwitchDarkMode(e.detail.checked))
            }
          >
            Enable Quick Switch
          </IonToggle>
        </IonItem>
      </IonList>
      <HelperText>
        If enabled, you can long-press the app header to toggle dark mode.
      </HelperText>
    </>
  );
}
