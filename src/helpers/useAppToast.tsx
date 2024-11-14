import { NotificationType } from "@capacitor/haptics";
// eslint-disable-next-line no-restricted-imports
import { useIonToast } from "@ionic/react";
import { createContext, useContext, useRef } from "react";

import { isNative } from "./device";
import { baseToastOptions } from "./toast";
import useHapticFeedback from "./useHapticFeedback";

export interface AppToastOptions {
  message: string;
  color?: Color;
  position?: "top" | "bottom";
  icon?: string;
  centerText?: boolean;
  fullscreen?: boolean;
  duration?: number;
  onClick?: (e: MouseEvent, dismiss: ReturnType<typeof useIonToast>[1]) => void;
}

type Color = "success" | "warning" | "danger" | "primary";

export default function useAppToast() {
  return useContext(AppToastContext);
}

function useSingletonAppToast() {
  const [presentIonToast, dismissIonToast] = useIonToast();
  const vibrate = useHapticFeedback();

  const toastIsPresentedRef = useRef(false);
  const queuedToastRef = useRef<AppToastOptions>();

  return present;

  function onDidDismiss() {
    toastIsPresentedRef.current = false;

    requestAnimationFrame(() => {
      if (queuedToastRef.current) {
        present(queuedToastRef.current);
        queuedToastRef.current = undefined;
      }
    });
  }

  async function present(options: AppToastOptions) {
    if (toastIsPresentedRef.current) {
      queuedToastRef.current = options;
      dismissIonToast();
      return;
    }

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

    toastIsPresentedRef.current = true;

    presentIonToast({
      message: options.message,
      color: options.color ?? "primary",
      icon: options.icon,
      swipeGesture: "vertical",
      cssClass: options.centerText ? "center" : "",
      onDidDismiss,
      ...baseToastOptions(
        options.position ?? "bottom",
        !options.fullscreen,
        options.duration,
      ),
      htmlAttributes: options.onClick
        ? {
            onClick(e: MouseEvent) {
              options.onClick!(e, dismissIonToast);
            },
          }
        : undefined,
    });
  }
}

export function AppToastProvider({ children }: React.PropsWithChildren) {
  return (
    <AppToastContext.Provider value={useSingletonAppToast()}>
      {children}
    </AppToastContext.Provider>
  );
}

const AppToastContext = createContext<ReturnType<typeof useSingletonAppToast>>(
  async () => {
    // noop
  },
);
