import { IonList } from "@ionic/react";

import BiometricEnabled from "./settings/BiometricEnabled";
import BiometricTimeout from "./settings/BiometricTimeout";

export default function BiometricSettings() {
  return (
    <IonList inset color="primary">
      <BiometricEnabled />
      <BiometricTimeout />
    </IonList>
  );
}
