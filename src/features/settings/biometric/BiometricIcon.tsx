import { IonIcon } from "@ionic/react";
import { BiometricMethod } from "capacitor-biometric-lock";
import { eye, fingerPrint } from "ionicons/icons";

import { useAppSelector } from "#/store";

import { faceid } from "../../icons";
import { primaryBiometricTypeSelector } from "./biometricSlice";

export default function BiometricIcon() {
  const primaryBiometricType = useAppSelector(primaryBiometricTypeSelector);

  const icon = (() => {
    switch (primaryBiometricType) {
      case BiometricMethod.faceAuthentication:
      case BiometricMethod.faceId:
        return faceid;
      case BiometricMethod.fingerprintAuthentication:
      case BiometricMethod.touchId:
        return fingerPrint;
      case BiometricMethod.irisAuthentication:
        return eye;
    }
  })();

  return <IonIcon icon={icon} />;
}
