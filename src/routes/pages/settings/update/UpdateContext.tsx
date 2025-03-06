import { useDocumentVisibility, useInterval } from "@mantine/hooks";
import { asyncNoop } from "es-toolkit";
import React, {
  createContext,
  useEffect,
  experimental_useEffectEvent as useEffectEvent,
  useRef,
  useState,
} from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

import { isNative } from "#/helpers/device";

type UpdateStatus =
  | "not-enabled"
  | "loading"
  | "current"
  | "outdated"
  | "error";

interface IUpdateContext {
  // used for determining whether page needs to be scrolled up first
  checkForUpdates: () => Promise<void>;
  updateServiceWorker: () => Promise<void>;
  status: UpdateStatus;
}

export const UpdateContext = createContext<IUpdateContext>({
  checkForUpdates: asyncNoop,
  updateServiceWorker: asyncNoop,

  status: "loading",
});

export function UpdateContextProvider({ children }: React.PropsWithChildren) {
  if (isNative()) return children;

  return (
    <EnabledUpdateContextProvider>{children}</EnabledUpdateContextProvider>
  );
}

function EnabledUpdateContextProvider({ children }: React.PropsWithChildren) {
  const [status, setStatus] = useState<UpdateStatus>("not-enabled");
  const documentState = useDocumentVisibility();

  const registration = useRef<ServiceWorkerRegistration>(undefined);

  const registerSW = useRegisterSW({
    onRegistered(r) {
      setStatus("loading");
      if (!r) return;

      registration.current = r;
      checkForUpdates();
    },
    onRegisterError() {
      setStatus("error");
    },
  });

  useInterval(
    () => {
      checkForUpdates();
    },
    1_000 * 60 * 60,
    { autoInvoke: true },
  );

  const checkForUpdatesEvent = useEffectEvent(checkForUpdates);

  useEffect(() => {
    if (documentState === "hidden") return;

    checkForUpdatesEvent();
  }, [documentState]);

  async function checkForUpdates() {
    const r = registration.current;

    if (!r) {
      if (status === "not-enabled") return;
      setStatus("error");
      return;
    }

    try {
      await r.update();
    } catch (error) {
      setStatus("error");
      throw error;
    }

    setStatus((status) => {
      if (status === "outdated") return status;

      return r.waiting || r.installing ? "outdated" : "current";
    });
  }

  return (
    <UpdateContext
      value={{
        status,
        checkForUpdates,
        updateServiceWorker: registerSW.updateServiceWorker,
      }}
    >
      {children}
    </UpdateContext>
  );
}
