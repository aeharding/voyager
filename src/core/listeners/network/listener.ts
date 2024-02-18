import store from "../../../store";
import { getConnectionType, updateConnectionType } from "./networkSlice";
import { Network } from "@capacitor/network";
import { isNative } from "../../../helpers/device";

(async () => {
  if (!isNative()) return;

  await store.dispatch(getConnectionType());

  Network.addListener("networkStatusChange", ({ connectionType }) => {
    store.dispatch(updateConnectionType(connectionType));
  });
})();
