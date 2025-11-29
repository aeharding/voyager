import { BackButtonEventDetail } from "@ionic/core";
import { useIonAlert } from "@ionic/react";
import { useEffect, useRef } from "react";

import { useOptimizedIonRouter } from "#/helpers/useOptimizedIonRouter";
import { useAppSelector } from "#/store";

export function ConfirmLeaveFeedPrompt() {
  const router = useOptimizedIonRouter();
  const [presentAlert, dismissAlert] = useIonAlert();
  const isAlertOpenRef = useRef<boolean>(false);
  const confirmLeaveFeedPrompt = useAppSelector(
    (state) => state.settings.general.confirmLeaveFeedPrompt,
  );

  useEffect(() => {
    if (!confirmLeaveFeedPrompt) return;

    function onBackButton(event: CustomEvent<BackButtonEventDetail>): void {
      event.detail.register(10, (next) => {
        const routeInfo = router.getRouteInfo();

        const pushedByRoute = routeInfo?.pushedByRoute;

        // double back to dismiss alert and navigate back
        if (isAlertOpenRef.current) {
          dismissAlert();
          next();
          return;
        }

        // only show alert if navigating back to communities list
        if (
          !pushedByRoute ||
          !/^\/posts\/[\w\\.]+$/.test(pushedByRoute) ||
          document.querySelector(".pswp--open")
        ) {
          next();
          return;
        }

        isAlertOpenRef.current = true;

        presentAlert({
          header: "Are you sure you want to leave the feed?",
          message: "You will lose your progress.",
          backdropDismiss: false,
          buttons: [
            { text: "Cancel", role: "cancel" },
            { text: "Leave", handler: () => next() },
          ],
          onDidDismiss: () => {
            isAlertOpenRef.current = false;
          },
        });
      });
    }

    document.addEventListener("ionBackButton", onBackButton as EventListener);

    return () => {
      document.removeEventListener(
        "ionBackButton",
        onBackButton as EventListener,
      );
    };
  }, [confirmLeaveFeedPrompt, router, presentAlert, dismissAlert]);

  return null;
}
