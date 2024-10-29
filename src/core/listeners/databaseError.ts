import Dexie from "dexie";
import store from "../../store";
import { setDatabaseError } from "../../features/settings/settingsSlice";

window.addEventListener("unhandledrejection", (ev) => {
  switch (ev.reason.name) {
    case Dexie.errnames.DatabaseClosed:
      store.dispatch(setDatabaseError(ev.reason));
  }
});
