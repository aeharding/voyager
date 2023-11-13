import { BiometricMethod } from "capacitor-biometric-lock";
import { useAppSelector } from "../../../store";
import { primaryBiometricTypeSelector } from "./biometricSlice";

export default function BiometricTitle() {
  const primaryBiometricType = useAppSelector(primaryBiometricTypeSelector);

  switch (primaryBiometricType) {
    case BiometricMethod.faceId:
      return "Face ID & Passcode";
    case BiometricMethod.touchId:
      return "Touch ID & Passcode";
    case BiometricMethod.faceAuthentication:
      return "Face Auth & Passcode";
    case BiometricMethod.fingerprintAuthentication:
      return "Touch Auth & Passcode";
    case BiometricMethod.irisAuthentication:
      return "Iris & Passcode";
  }
}
