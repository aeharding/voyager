import { ua } from "#/helpers/device";

export default function useIsDeviceTwoColumnCapable() {
  return ua.getDevice().type !== "mobile";
}
