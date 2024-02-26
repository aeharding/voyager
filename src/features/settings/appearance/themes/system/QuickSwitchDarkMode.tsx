import { IonLabel, IonList, IonToggle } from "@ionic/react";
import {
  HelperText,
  InsetIonItem,
  ListHeader,
} from "../../../shared/formatting";
import { useAppDispatch, useAppSelector } from "../../../../../store";
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
        <InsetIonItem>
          <IonToggle
            checked={quickSwitch}
            onIonChange={(e) =>
              dispatch(setQuickSwitchDarkMode(e.detail.checked))
            }
          >
            Enable Quick Switch
          </IonToggle>
        </InsetIonItem>
      </IonList>
      <HelperText>
        If enabled, you can long-press the app header to toggle dark mode.
      </HelperText>
    </>
  );
}
