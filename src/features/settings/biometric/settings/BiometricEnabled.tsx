import { IonLabel, IonToggle } from "@ionic/react";
import { InsetIonItem } from "../../../user/Profile";
import BiometricTitle from "../biometricTitle";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { setBiometricsEnabled } from "../biometricSlice";

export default function BiometricEnabled() {
  const dispatch = useAppDispatch();
  const biometricsEnabled = useAppSelector(
    (state) => state.biometric.config?.enabled,
  );

  return (
    <InsetIonItem>
      <IonLabel>
        Lock with <BiometricTitle />
      </IonLabel>
      <IonToggle
        checked={biometricsEnabled}
        onIonChange={() => dispatch(setBiometricsEnabled(!biometricsEnabled))}
      />
    </InsetIonItem>
  );
}
