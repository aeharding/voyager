import {
  Haptics,
  ImpactOptions,
  NotificationOptions,
} from "@capacitor/haptics";
import { useCallback } from "react";
import { useAppSelector } from "../store";

export default function useHapticFeedback() {
  const enabled = useAppSelector(
    (state) => state.settings.general.enableHapticFeedback,
  );

  return useCallback(
    (options: ImpactOptions | NotificationOptions) => {
      if (!enabled) return;

      if ("style" in options) Haptics.impact(options);
      else Haptics.notification(options);
    },
    [enabled],
  );
}
