import { useIonToast } from "@ionic/react";
import { baseToastOptions } from "./toast";
import useHapticFeedback from "./useHapticFeedback";
import { isNative } from "./device";
import { NotificationType } from "@capacitor/haptics";
import { useCallback } from "react";

export interface AppToastOptions {
  message: string;
  color?: Color;
  position?: "top" | "bottom";
  icon?: string;
  centerText?: boolean;
  fullscreen?: boolean;
  duration?: number;
}

type Color = "success" | "warning" | "danger" | "primary";

export default function useAppToast() {
  const [present] = useIonToast();
  const vibrate = useHapticFeedback();

  return useCallback(
    (options: AppToastOptions) => {
      if (isNative())
        vibrate({
          type: (() => {
            switch (options.color) {
              case "primary":
              case undefined:
              case "success":
                return NotificationType.Success;
              case "warning":
                return NotificationType.Warning;
              case "danger":
                return NotificationType.Error;
            }
          })(),
        });

      present({
        message: options.message,
        color: options.color ?? "primary",
        icon: options.icon,
        swipeGesture: "vertical",
        cssClass: options.centerText ? "center" : "",
        ...baseToastOptions(
          options.position ?? "bottom",
          !options.fullscreen,
          options.duration,
        ),
      });
    },
    [present, vibrate],
  );
}
