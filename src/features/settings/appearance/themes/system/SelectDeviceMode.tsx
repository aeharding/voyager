import {
  IonItem,
  IonLabel,
  IonList,
  IonRadio,
  IonRadioGroup,
} from "@ionic/react";
import { useState } from "react";

import { useAppDispatch, useAppSelector } from "#/store";

import { setDeviceMode } from "../../../settingsSlice";
import { getDeviceModeLabel } from "./DeviceMode";

const MODES = ["ios", "md"] as const;

export default function SelectDeviceMode() {
  const dispatch = useAppDispatch();
  const deviceMode = useAppSelector(
    (state) => state.settings.appearance.deviceMode,
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
            <IonItem key={mode} onClick={() => setSelectedDeviceMode(mode)}>
              <IonRadio value={mode}>{getDeviceModeLabel(mode)}</IonRadio>
            </IonItem>
          ))}
        </IonList>
      </IonRadioGroup>

      {selectedDeviceMode !== deviceMode && (
        <IonList inset>
          <IonItem detail onClick={apply}>
            <IonLabel>Tap to apply changes and reload app</IonLabel>
          </IonItem>
        </IonList>
      )}
    </>
  );
}
