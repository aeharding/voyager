import { App } from "@capacitor/app";
import { BackButtonEventDetail } from "@ionic/core";
import { useEffect } from "react";

import { useOptimizedIonRouter } from "#/helpers/useOptimizedIonRouter";

export default function AndroidBackButton() {
  const router = useOptimizedIonRouter();

  // Back button handling for Android native app
  useEffect(() => {
    const backButtonHandler = (ev: CustomEvent<BackButtonEventDetail>) => {
      ev.detail.register(-1, () => {
        // pswp is the gallery component. It pushes state, but the router isn't aware.
        // So if that's open, don't close the app just yet
        if (!router.canGoBack() && !document.querySelector(".pswp--open")) {
          App.exitApp();
        }
      });
    };

    document.addEventListener(
      "ionBackButton",
      backButtonHandler as EventListener,
    );

    return () => {
      document.removeEventListener(
        "ionBackButton",
        backButtonHandler as EventListener,
      );
    };
  }, [router]);

  return null;
}
