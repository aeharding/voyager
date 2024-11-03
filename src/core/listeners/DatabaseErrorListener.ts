import Dexie from "dexie";
import { useAppDispatch } from "../../store";
import { setDatabaseError } from "../../features/settings/settingsSlice";
import { useContext, useEffect } from "react";
import { PageContext } from "../../features/auth/PageContext";

export default function DatabaseErrorListener() {
  const { presentDatabaseErrorModal } = useContext(PageContext);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const listener = (ev: PromiseRejectionEvent) => {
      switch (ev.reason.name) {
        case Dexie.errnames.Unknown:
        case Dexie.errnames.DatabaseClosed: {
          dispatch(setDatabaseError(ev.reason));
          presentDatabaseErrorModal(true);
        }
      }
    };

    window.addEventListener("unhandledrejection", listener);

    return () => window.removeEventListener("unhandledrejection", listener);
  });

  return null;
}
