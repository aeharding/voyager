import { IonLabel, IonList, IonRadio, IonRadioGroup } from "@ionic/react";
import { InsetIonItem } from "../../../../user/Profile";
import { getDeviceModeLabel } from "./DeviceMode";
import { useAppDispatch, useAppSelector } from "../../../../../store";
import { useState } from "react";
import { setDeviceMode } from "../../../settingsSlice";

const MODES = ["ios", "md"] as const;

export default function SelectDeviceMode() {
  const dispatch = useAppDispatch();
  const deviceMode = useAppSelector(
    (state) => state.settings.appearance.deviceMode
  );
  const [selectedDeviceMode, setSelectedDeviceMode] = useState(deviceMode);

  function apply() {
    dispatch(setDeviceMode(selectedDeviceMode));
    location.reload();
  }
  return (
    <>
      <IonRadioGroup
        value={selectedDeviceMode}
        onIonChange={(e) => setSelectedDeviceMode(e.detail.value)}
      >
        <IonList inset>
          {MODES.map((mode) => (
            <InsetIonItem
              key={mode}
              onClick={() => setSelectedDeviceMode(mode)}
            >
              <IonLabel>{getDeviceModeLabel(mode)}</IonLabel>
              <IonRadio value={mode} />
            </InsetIonItem>
          ))}
        </IonList>
      </IonRadioGroup>

      {selectedDeviceMode !== deviceMode && (
        <IonList inset>
          <InsetIonItem detail onClick={apply}>
            <IonLabel>Tap to apply changes and reload app</IonLabel>
          </InsetIonItem>
        </IonList>
      )}
    </>
  );
}
