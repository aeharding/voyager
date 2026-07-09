import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect } from "react";

import { toggleMaximize } from "#/core/tauri/WindowChrome";
import { getPlatform } from "#/helpers/device";
import store from "#/store";

const INTERACTIVE_SELECTOR = [
  "ion-button",
  "ion-back-button",
  "ion-menu-button",
  "ion-searchbar",
  "ion-segment",
  "ion-input",
  "button",
  "a[href]",
  "input",
  "textarea",
  "select",
  "[role='button']",
].join(", ");

/**
 * With native decorations off, empty header space is the titlebar
 * (drag to move, double-click to maximize)
 */
export default function TauriListener() {
  useEffect(() => {
    if (getPlatform() !== "tauri") return;

    function onMouseDown(event: MouseEvent) {
      if (event.button !== 0) return;
      if (store.getState().settings.appearance.general.showSystemTitlebar)
        return;
      if (!(event.target instanceof Element)) return;

      const header = event.target.closest("ion-header");
      if (!header) return;

      // Headers in overlays belong to the overlay, not the window
      if (header.closest("ion-modal, ion-popover")) return;

      if (event.target.closest(INTERACTIVE_SELECTOR)) return;

      if (event.detail === 2) {
        toggleMaximize();
      } else {
        getCurrentWindow().startDragging();
      }
    }

    document.addEventListener("mousedown", onMouseDown);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, []);

  return null;
}
