import { IonLabel, IonList } from "@ionic/react";

import { ListHeader } from "#/features/settings/shared/formatting";
import { getPlatform, isAppleDeviceInstallable } from "#/helpers/device";

import AlwaysUseReaderMode from "./AlwaysUseReaderMode";

export default function Safari() {
  if (getPlatform() !== "capacitor" || !isAppleDeviceInstallable()) return;

  return (
    <>
      <ListHeader>
        <IonLabel>Safari</IonLabel>
      </ListHeader>
      <IonList inset>
        <AlwaysUseReaderMode />
      </IonList>
    </>
  );
}
