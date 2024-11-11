import SettingSelector from "#/features/settings/shared/SettingSelector";
import { useAppSelector } from "#/store";

import { setBiometricsTimeoutInSeconds } from "../biometricSlice";

const OBiometricTimeoutType = {
  Immediately: 0,
  OneMinute: 60,
  FiveMinutes: 300,
  OneHour: 3_600,
} as const;

export default function BiometricTimeout() {
  const timeoutInSeconds =
    useAppSelector((state) => state.biometric.config?.timeoutInSeconds) ?? 0;

  return (
    <SettingSelector
      title="Require Authentication"
      selected={timeoutInSeconds}
      setSelected={setBiometricsTimeoutInSeconds}
      options={OBiometricTimeoutType}
      getOptionLabel={(option) => {
        switch (option) {
          case OBiometricTimeoutType.Immediately:
            return "Immediately";
          case OBiometricTimeoutType.OneMinute:
            return "After 1 Minute";
          case OBiometricTimeoutType.FiveMinutes:
            return "After 5 Minutes";
          case OBiometricTimeoutType.OneHour:
            return "After 1 Hour";
        }
      }}
      getSelectedLabel={(option) => {
        switch (option) {
          case OBiometricTimeoutType.Immediately:
            return "Immediately";
          case OBiometricTimeoutType.OneMinute:
            return "1 Minute";
          case OBiometricTimeoutType.FiveMinutes:
            return "5 Minutes";
          case OBiometricTimeoutType.OneHour:
            return "1 Hour";
        }
      }}
    />
  );
}
