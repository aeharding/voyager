import { IonLabel, IonList } from "@ionic/react";

import { ListHeader } from "../TextSize";
import DeviceMode from "./DeviceMode";
import ThemeSelector from "./ThemeSelector";

export default function System() {
  return (
    <>
      <ListHeader>
        <IonLabel>System</IonLabel>
      </ListHeader>
      <IonList inset>
        <DeviceMode />
      </IonList>

      <ThemeSelector />
    </>
  );
}
