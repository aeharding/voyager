import { BackButtonEventDetail } from "@ionic/core";
import { useEffect } from "react";

// ion-modal is 100: https://ionicframework.com/docs/developing/hardware-back-button#internal-framework-handlers
export default function useIonNavBackButtonListener(
  ref: React.RefObject<HTMLElement | null>,
  priority = 110,
) {
  // Back button handling for Android native app
  useEffect(() => {
    const nav = ref.current?.closest("ion-nav");
    if (!nav) return;

    const backButtonHandler = (ev: CustomEvent<BackButtonEventDetail>) => {
      ev.detail.register(priority, async (processNextHandler) => {
        if (await nav.canGoBack()) {
          nav.pop();
        } else {
          processNextHandler();
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
  }, [priority, ref]);
}
