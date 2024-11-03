import { Mode } from "@ionic/core";
import { IonItem, IonLabel } from "@ionic/react";

import { useAppSelector } from "#/store";

export default function DeviceMode() {
  const deviceMode = useAppSelector(
    (state) => state.settings.appearance.deviceMode,
  );

  return (
    <>
      <IonItem button routerLink="/settings/appearance/theme/mode">
        <IonLabel>Device Mode</IonLabel>
        <IonLabel slot="end" color="medium" className="ion-no-margin">
          {getDeviceModeLabel(deviceMode)}
        </IonLabel>
      </IonItem>
    </>
  );
}

export function getDeviceModeLabel(mode: Mode): string {
  switch (mode) {
    case "ios":
      return "Apple";
    case "md":
      return "Android (beta)";
  }
}
