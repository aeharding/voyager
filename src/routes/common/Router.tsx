import { IonReactMemoryRouter, IonReactRouter } from "@ionic/react-router";
import { createMemoryHistory } from "history";
import React, { useEffect } from "react";

import { isAppleDeviceInstalledToHomescreen } from "#/helpers/device";

export const memoryHistory = isAppleDeviceInstalledToHomescreen()
  ? createMemoryHistory()
  : undefined;

export default function Router({ children }: React.PropsWithChildren) {
  useEffect(() => {
    if (!memoryHistory) return;

    const unListen = memoryHistory.listen(() => {
      window.scrollTo(0, 0);
    });
    return () => {
      unListen();
    };
  }, []);

  /**
   * This is a total hack to prevent native page swipe gesture
   * on iOS. If there's no page history to swipe,
   * what are you going to do, Apple... 😈
   */
  if (memoryHistory) {
    return (
      <IonReactMemoryRouter history={memoryHistory}>
        {children}
      </IonReactMemoryRouter>
    );
  }

  return <IonReactRouter>{children}</IonReactRouter>;
}
