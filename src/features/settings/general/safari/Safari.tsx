import { isAppleDeviceInstallable, isNative } from "../../../../helpers/device";
import { IonLabel, IonList } from "@ionic/react";
import { ListHeader } from "../../shared/formatting";
import AlwaysUseReaderMode from "./AlwaysUseReaderMode";

export default function Safari() {
  if (!isNative() || !isAppleDeviceInstallable()) return;

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
