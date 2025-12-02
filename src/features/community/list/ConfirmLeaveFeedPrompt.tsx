import { BackButtonEventDetail } from "@ionic/core";
import { useIonAlert } from "@ionic/react";
import { useEffect, useRef } from "react";

import { setConfirmLeaveFeedPrompt } from "#/features/settings/settingsSlice";
import { useOptimizedIonRouter } from "#/helpers/useOptimizedIonRouter";
import { useAppDispatch, useAppSelector } from "#/store";

export function ConfirmLeaveFeedPrompt() {
  const router = useOptimizedIonRouter();
  const [presentAlert, dismissAlert] = useIonAlert();
  const isAlertOpenRef = useRef<boolean>(false);
  const confirmLeaveFeedPrompt = useAppSelector(
    (state) => state.settings.general.confirmLeaveFeedPrompt,
  );
  const dispatch = useAppDispatch();
  const dontAskAgainRef = useRef(false);

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
          // check if gallery is open
          // (this feature isn't ios only, so this should work)
          location.hash
        ) {
          next();
          return;
        }

        isAlertOpenRef.current = true;

        presentAlert({
          header: "Are you sure you want to leave the feed?",
          message: "You will lose your progress.",
          backdropDismiss: false,
          inputs: [
            {
              name: "dontAskAgain",
              type: "checkbox",
              label: "Don't ask me again",
              handler: (input) => {
                dontAskAgainRef.current = input.checked ?? false;
              },
            },
          ],
          buttons: [
            { text: "Cancel", role: "cancel" },
            {
              text: "Leave",
              handler: () => {
                if (dontAskAgainRef.current)
                  dispatch(setConfirmLeaveFeedPrompt(false));

                next();
              },
            },
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
  }, [confirmLeaveFeedPrompt, router, presentAlert, dismissAlert, dispatch]);

  return null;
}
