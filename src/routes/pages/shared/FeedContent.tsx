import { Color } from "@ionic/core";
import { IonContent } from "@ionic/react";
import { noop } from "es-toolkit";
import React, { createContext, useState } from "react";

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

export function FeedContentWithColorContext(
  props: React.ComponentProps<typeof IonContent>,
) {
  const [color, setColor] = useState<Color | undefined>(undefined);

  return (
    <FeedContentColorContext value={{ color, setColor }}>
      <FeedContent {...props} color={color ?? props.color} />
    </FeedContentColorContext>
  );
}

export const FeedContentColorContext = createContext<{
  color: Color | undefined;
  setColor: (color: Color | undefined) => void;
}>({
  color: undefined,
  setColor: noop,
});
