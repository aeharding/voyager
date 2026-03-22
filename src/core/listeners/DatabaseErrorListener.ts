import Dexie from "dexie";
import { use, useEffect } from "react";

import { SharedDialogContext } from "#/features/auth/SharedDialogContext";
import { setDatabaseError } from "#/features/settings/settingsSlice";
import { useAppDispatch } from "#/store";

export default function DatabaseErrorListener() {
  const { presentAppErrorModal } = use(SharedDialogContext);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const listener = (ev: PromiseRejectionEvent) => {
      switch (ev.reason.name) {
        case Dexie.errnames.MissingAPI:
        case Dexie.errnames.Unknown:
        case Dexie.errnames.DatabaseClosed: {
          dispatch(setDatabaseError(ev.reason));
          presentAppErrorModal(true);
        }
      }
    };

    window.addEventListener("unhandledrejection", listener);

    return () => window.removeEventListener("unhandledrejection", listener);
  });

  return null;
}
