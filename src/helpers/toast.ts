import { ToastOptions } from "@ionic/core";

export function baseToastOptions(
  position: "top" | "bottom",
  presentAlongsideAppBars = true,
): ToastOptions {
  const BASE = {
    duration: 3500,
  };

  switch (position) {
    case "bottom":
      return {
        ...BASE,
        position: "bottom",
        positionAnchor: presentAlongsideAppBars
          ? document.querySelector("ion-tab-bar") ?? undefined
          : undefined,
      };
    case "top":
      return {
        ...BASE,
        position: "top",
        positionAnchor: presentAlongsideAppBars
          ? document.querySelector("ion-header") ?? undefined
          : undefined,
      };
  }
}
