import React, { createContext, useEffect, useRef, useState } from "react";
import { useInterval } from "usehooks-ts";
import { useRegisterSW } from "virtual:pwa-register/react";
import usePageVisibility from "../../../helpers/usePageVisibility";

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
  checkForUpdates: async () => {},
  updateServiceWorker: async () => {},

  status: "loading",
});

export function UpdateContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState<UpdateStatus>("not-enabled");
  const pageVisibility = usePageVisibility();

  const registration = useRef<ServiceWorkerRegistration>();

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

  useInterval(() => {
    checkForUpdates();
  }, 1_000 * 60 * 60);

  useEffect(() => {
    if (!pageVisibility) return;

    checkForUpdates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageVisibility]);

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
