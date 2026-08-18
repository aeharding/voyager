import { isPlatform } from "@ionic/core";

import { getPlatform } from "#/helpers/device";

export default function useIsDeviceTwoColumnCapable() {
  if (getPlatform() === "tauri") return true;

  return isPlatform("desktop") || isPlatform("tablet") || isPlatform("phablet");
}
