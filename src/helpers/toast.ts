import { ToastOptions } from "@ionic/core";

export const DEFAULT_TOAST_DURATION = 3_000;

export function baseToastOptions(
  position: "top" | "bottom",
  presentAlongsideAppBars = true,
  duration = DEFAULT_TOAST_DURATION,
): ToastOptions {
  switch (position) {
    case "bottom":
      return {
        duration,
        position: "bottom",
        positionAnchor: presentAlongsideAppBars
          ? document.querySelector("ion-tab-bar") || undefined
          : undefined,
      };
    case "top":
      return {
        duration,
        position: "top",
        positionAnchor: presentAlongsideAppBars
          ? (document.querySelector(
              "ion-router-outlet > .ion-page:not(.ion-page-hidden) ion-header",
            ) as HTMLElement) || undefined
          : undefined,
      };
  }
}
