import { IonReactMemoryRouter, IonReactRouter } from "@ionic/react-router";
import React, { useLayoutEffect } from "react";
import { Location, useLocation } from "react-router";

import { isAppleDeviceInstalledToHomescreen } from "#/helpers/device";

const usingMemoryRouter = isAppleDeviceInstalledToHomescreen();

let currentLocation: Location | undefined;

/**
 * Current react-router location for code that can't use `useLocation`
 * (crash screen, non-React helpers). With the memory router,
 * `window.location` never updates, so this is the only source of truth.
 */
export function getRouterLocation() {
  return currentLocation;
}

function LocationBridge({ children }: React.PropsWithChildren) {
  const location = useLocation();

  useLayoutEffect(() => {
    currentLocation = location;

    // window never navigates with the memory router, so reset scroll manually
    if (usingMemoryRouter) window.scrollTo(0, 0);
  }, [location]);

  return children;
}

export default function Router({ children }: React.PropsWithChildren) {
  /**
   * This is a total hack to prevent native page swipe gesture
   * on iOS. If there's no page history to swipe,
   * what are you going to do, Apple... 😈
   */
  if (usingMemoryRouter) {
    return (
      <IonReactMemoryRouter>
        <LocationBridge>{children}</LocationBridge>
      </IonReactMemoryRouter>
    );
  }

  return (
    <IonReactRouter>
      <LocationBridge>{children}</LocationBridge>
    </IonReactRouter>
  );
}
