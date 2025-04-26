import { isPlatform } from "@ionic/core";

export default function useIsDeviceTwoColumnCapable() {
  return isPlatform("desktop") || isPlatform("tablet") || isPlatform("phablet");
}
