import { Mode } from "@ionic/core";
import { useAppSelector } from "../../../../../store";
import { InsetIonItem } from "../../../../user/Profile";
import { IonLabel } from "@ionic/react";

export default function DeviceMode() {
  const deviceMode = useAppSelector(
    (state) => state.settings.appearance.deviceMode
  );

  return (
    <>
      <InsetIonItem button routerLink="/settings/appearance/theme/mode">
        <IonLabel>Device Mode</IonLabel>
        <IonLabel slot="end" color="medium">
          {getDeviceModeLabel(deviceMode)}
        </IonLabel>
      </InsetIonItem>
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
