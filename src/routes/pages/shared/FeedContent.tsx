import { IonContent } from "@ionic/react";

import {
  isAppleDeviceInstalledToHomescreen,
  isNative,
  isTouchDevice,
} from "#/helpers/device";

interface FeedContentProps extends React.PropsWithChildren {
  className?: string;
}

// There is some strange behavior that needs to be sorted before this
// can be enabled
export const isSafariFeedHackEnabled =
  !isNative() && isAppleDeviceInstalledToHomescreen() && isTouchDevice();

// All of this terrible code is to deal with safari being safari >:(
// https://bugs.webkit.org/show_bug.cgi?id=222654

export default function FeedContent({ children, className }: FeedContentProps) {
  return (
    <IonContent className={className} scrollY={isSafariFeedHackEnabled}>
      {children}
    </IonContent>
  );
}
