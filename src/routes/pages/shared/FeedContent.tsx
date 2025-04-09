import { IonContent } from "@ionic/react";
import React from "react";

import {
  isAppleDeviceInstalledToHomescreen,
  isNative,
  isTouchDevice,
} from "#/helpers/device";

// There is some strange behavior that needs to be sorted before this
// can be enabled
export const isSafariFeedHackEnabled =
  !isNative() && isAppleDeviceInstalledToHomescreen() && isTouchDevice();

// All of this terrible code is to deal with safari being safari >:(
// https://bugs.webkit.org/show_bug.cgi?id=222654

export default function FeedContent(
  props: React.ComponentProps<typeof IonContent>,
) {
  return <IonContent {...props} scrollY={isSafariFeedHackEnabled} />;
}
