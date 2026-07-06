import { Network } from "@capacitor/network";

import { getPlatform } from "#/helpers/device";
import store from "#/store";

import { getConnectionType, updateConnectionType } from "./networkSlice";

(async () => {
  if (getPlatform() !== "capacitor") return;

  await store.dispatch(getConnectionType());

  Network.addListener("networkStatusChange", ({ connectionType }) => {
    store.dispatch(updateConnectionType(connectionType));
  });
})();
