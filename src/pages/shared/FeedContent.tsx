import { IonContent, useIonViewWillEnter } from "@ionic/react";
import React, { useRef } from "react";
import {
  isAppleDeviceInstalledToHomescreen,
  isNative,
  isTouchDevice,
} from "../../helpers/device";

interface FeedContentProps {
  children: React.ReactNode;
  className?: string;
}

// There is some strange behavior that needs to be sorted before this
// can be enabled
export const isSafariFeedHackEnabled =
  !isNative() && isAppleDeviceInstalledToHomescreen() && isTouchDevice();

// All of this terrible code is to deal with safari being safari >:(
// https://bugs.webkit.org/show_bug.cgi?id=222654

export default function FeedContent({ children, className }: FeedContentProps) {
  const ref = useRef();

  useIonViewWillEnter(() => {
    if (!document.body.classList.contains("hide-bars")) return;

    requestAnimationFrame(() => {
      const scrollView = ref.current?.querySelector?.(".virtual-scroller");

      if (scrollView.scrollTop < 44) scrollView.scrollTop = 44;
    });
  });

  return (
    <IonContent
      ref={ref}
      className={className}
      scrollY={isSafariFeedHackEnabled}
    >
      {children}
    </IonContent>
  );
}
