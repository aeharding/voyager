import { IonReactMemoryRouter, IonReactRouter } from "@ionic/react-router";
import React, { ComponentProps } from "react";

import { isAppleDeviceInstalledToHomescreen } from "#/helpers/device";

const SHARED_ROUTER_PARAMS = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
} as const satisfies ComponentProps<
  typeof IonReactMemoryRouter & typeof IonReactRouter
>;

export default function Router({ children }: React.PropsWithChildren) {
  /**
   * This is a total hack to prevent native page swipe gesture
   * on iOS. If there's no page history to swipe,
   * what are you going to do, Apple... 😈
   */
  if (isAppleDeviceInstalledToHomescreen()) {
    return (
      <IonReactMemoryRouter {...SHARED_ROUTER_PARAMS}>
        {children}
      </IonReactMemoryRouter>
    );
  }

  return <IonReactRouter {...SHARED_ROUTER_PARAMS}>{children}</IonReactRouter>;
}
