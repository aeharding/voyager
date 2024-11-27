import { IonItem, IonToggle } from "@ionic/react";

import { useAppDispatch, useAppSelector } from "#/store";

import { setBiometricsEnabled } from "../biometricSlice";
import BiometricTitle from "../BiometricTitle";

export default function BiometricEnabled() {
  const dispatch = useAppDispatch();
  const biometricsEnabled = useAppSelector(
    (state) => state.biometric.config?.enabled,
  );

  return (
    <IonItem>
      <IonToggle
        checked={biometricsEnabled}
        onIonChange={() => dispatch(setBiometricsEnabled(!biometricsEnabled))}
      >
        Lock with <BiometricTitle />
      </IonToggle>
    </IonItem>
  );
}
