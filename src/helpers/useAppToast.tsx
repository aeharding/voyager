import { NotificationType } from "@capacitor/haptics";
import { Color } from "@ionic/core";
import { IonIcon } from "@ionic/react";
import { createContext, MouseEvent, useContext, useRef } from "react";

import Toast, { ToastHandler } from "#/features/shared/toast/Toast";

import { isNative } from "./device";
import useHapticFeedback from "./useHapticFeedback";

import styles from "./useAppToast.module.css";

export interface AppToastOptions {
  message: string;
  color?: Color;
  position?: "top" | "bottom";
  icon?: string;
  fullscreen?: boolean;
  duration?: number;
  onClick?: (e: MouseEvent, dismiss: () => void) => void;
}

export default function useAppToast() {
  return useContext(AppToastContext);
}

export function AppToastProvider({ children }: React.PropsWithChildren) {
  const vibrate = useHapticFeedback();
  const toastRef = useRef<ToastHandler>(undefined);
  const openRef = useRef(false);
  const queuedOptionsRef = useRef<AppToastOptions>(undefined);

  async function present(options: AppToastOptions) {
    if (openRef.current) {
      queuedOptionsRef.current = options;
      closeHandler();
      return;
    }

    if (isNative())
      vibrate({
        type: (() => {
          switch (options.color) {
            default:
            case "primary":
            case "success":
              return NotificationType.Success;
            case "warning":
              return NotificationType.Warning;
            case "danger":
              return NotificationType.Error;
          }
        })(),
      });

    const content = (
      <>
        {options.icon && (
          <IonIcon icon={options.icon} className={styles.icon} />
        )}
        <div className={styles.message}>{options.message}</div>
      </>
    );

    openRef.current = true;

    toastRef.current?.open({
      ...options,
      content,
      onClick: (e) => options?.onClick?.(e, closeHandler),
    });
  }

  function closeHandler() {
    toastRef.current?.close();
  }

  function onClose() {
    openRef.current = false;

    if (queuedOptionsRef.current) {
      const queuedOptions = queuedOptionsRef.current;
      queuedOptionsRef.current = undefined;
      present(queuedOptions);
    }
  }

  return (
    <AppToastContext value={present}>
      <Toast ref={toastRef} onClose={onClose} />
      {children}
    </AppToastContext>
  );
}

type PresentFn = (options: AppToastOptions) => Promise<void>;

const AppToastContext = createContext<PresentFn>(async () => {
  // noop
});
