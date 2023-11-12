import { useAppSelector } from "../../../store";
import { primaryBiometricTypeSelector } from "./biometricSlice";
import { BiometryType } from "@aparajita/capacitor-biometric-auth";

export default function BiometricTitle() {
  const primaryBiometricType = useAppSelector(primaryBiometricTypeSelector);

  switch (primaryBiometricType) {
    case BiometryType.faceId:
      return "Face ID & Passcode";
    case BiometryType.touchId:
      return "Touch ID & Passcode";
    case BiometryType.faceAuthentication:
      return "Face Auth & Passcode";
    case BiometryType.fingerprintAuthentication:
      return "Touch Auth & Passcode";
    case BiometryType.irisAuthentication:
      return "Iris & Passcode";
  }
}
