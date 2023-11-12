import { IonIcon } from "@ionic/react";
import { BiometryType } from "@aparajita/capacitor-biometric-auth";
import { faceid } from "../../icons";
import { eye, fingerPrint } from "ionicons/icons";
import { useAppSelector } from "../../../store";
import { primaryBiometricTypeSelector } from "./biometricSlice";

export default function BiometricIcon() {
  const primaryBiometricType = useAppSelector(primaryBiometricTypeSelector);

  const icon = (() => {
    switch (primaryBiometricType) {
      case BiometryType.faceAuthentication:
      case BiometryType.faceId:
        return faceid;
      case BiometryType.fingerprintAuthentication:
      case BiometryType.touchId:
        return fingerPrint;
      case BiometryType.irisAuthentication:
        return eye;
    }
  })();

  return <IonIcon icon={icon} />;
}
