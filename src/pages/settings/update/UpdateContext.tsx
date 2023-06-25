import React, { createContext, useEffect, useRef, useState } from "react";
import { useInterval } from "usehooks-ts";
import { useRegisterSW } from "virtual:pwa-register/react";
import usePageVisibility from "../../../helpers/usePageVisibility";

type UpdateStatus = "loading" | "current" | "outdated" | "error";

interface IUpdateContext {
  // used for determining whether page needs to be scrolled up first
  checkForUpdates: () => Promise<void>;
  updateServiceWorker: () => Promise<void>;
  status: UpdateStatus;
}

export const UpdateContext = createContext<IUpdateContext>({
  checkForUpdates: async () => {},
  updateServiceWorker: async () => {},

  status: "loading",
});

export function UpdateContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState<UpdateStatus>("loading");
  const pageVisibility = usePageVisibility();

  const registration = useRef<ServiceWorkerRegistration>();

  const registerSW = useRegisterSW({
    onRegistered(r) {
      if (!r) return;

      registration.current = r;
      checkForUpdates();
    },
  });

  useInterval(() => {
    checkForUpdates();
  }, 1_000 * 60 * 60);

  useEffect(() => {
    if (!pageVisibility) return;

    checkForUpdates();
  }, [pageVisibility]);

  async function checkForUpdates() {
    const r = registration.current;

    if (!r) {
      setStatus("error");
      return;
    }

    try {
      await r.update();
    } catch (error) {
      setStatus("error");
      throw error;
    }

    setStatus(!!(r.waiting || r.installing) ? "outdated" : "current");
  }

  return (
    <UpdateContext.Provider
      value={{
        status,
        checkForUpdates,
        updateServiceWorker: registerSW.updateServiceWorker,
      }}
    >
      {children}
    </UpdateContext.Provider>
  );
}
