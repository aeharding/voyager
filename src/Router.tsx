import { IonReactMemoryRouter, IonReactRouter } from "@ionic/react-router";
import { MemoryHistory, createMemoryHistory } from "history";
import React, { useEffect } from "react";
import { isAppleDeviceInstalledToHomescreen } from "./helpers/device";

export let memoryHistory: MemoryHistory | undefined;

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
  if (isAppleDeviceInstalledToHomescreen()) {
    memoryHistory = history;
    return (
      <IonReactMemoryRouter history={history}>{children}</IonReactMemoryRouter>
    );
  }

  memoryHistory = undefined;
  return <IonReactRouter>{children}</IonReactRouter>;
}
