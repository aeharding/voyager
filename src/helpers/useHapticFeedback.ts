import { Haptics, ImpactOptions } from "@capacitor/haptics";
import { useCallback } from "react";
import { useAppSelector } from "../store";

export default function useHapticFeedback() {
  const enabled = useAppSelector(
    (state) => state.settings.general.enableHapticFeedback,
  );

  return useCallback(
    (options: ImpactOptions) => {
      if (!enabled) return;

      Haptics.impact(options);
    },
    [enabled],
  );
}
