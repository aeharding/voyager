import { IonReactMemoryRouter, IonReactRouter } from "@ionic/react-router";
import { createMemoryHistory } from "history";
import React, { useEffect } from "react";
import { isAppleDeviceInstalledToHomescreen } from "./helpers/device";

export default function Router({ children }: { children: React.ReactNode }) {
  const history = createMemoryHistory();

  useEffect(() => {
    const unListen = history.listen(() => {
      window.scrollTo(0, 0);
    });
    return () => {
      unListen();
    };
  }, [history]);

  /**
   * This is a total hack to prevent native page swipe gesture
   * on iOS. If there's no page history to swipe,
   * what are you going to do, Apple... 😈
   */
  if (isAppleDeviceInstalledToHomescreen())
    return (
      <IonReactMemoryRouter history={history}>{children}</IonReactMemoryRouter>
    );

  return <IonReactRouter>{children}</IonReactRouter>;
}
