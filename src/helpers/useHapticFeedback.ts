import { Capacitor, CapacitorException, ExceptionCode } from "@capacitor/core";
import {
  Haptics,
  ImpactOptions,
  NotificationOptions,
} from "@capacitor/haptics";
import { useCallback } from "react";

import { useAppSelector } from "#/store";

export default function useHapticFeedback() {
  const enabled = useAppSelector(
    (state) => state.settings.general.enableHapticFeedback,
  );

  return useCallback(
    async (options: ImpactOptions | NotificationOptions) => {
      if (!enabled) return;

      try {
        if ("style" in options) await Haptics.impact(options);
        else await Haptics.notification(options);
      } catch (e) {
        // Ignore if the web browser doesn't support haptics
        if (
          Capacitor.getPlatform() === "web" &&
          e instanceof CapacitorException &&
          e.code === ExceptionCode.Unavailable
        )
          return;

        throw e;
      }
    },
    [enabled],
  );
}
