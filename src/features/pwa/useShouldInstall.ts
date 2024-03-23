import { useContext } from "react";
import { BeforeInstallPromptContext } from "./BeforeInstallPromptProvider";
import {
  isAppleDeviceInstallable,
  isInstalled,
  isTouchDevice,
} from "../../helpers/device";

export default function useShouldInstall() {
  const { event } = useContext(BeforeInstallPromptContext);

  if (isInstalled()) return false;
  if (isAppleDeviceInstallable()) return true;
  if (!isTouchDevice()) return false;
  if (event) return true;

  return false;
}
