import { getCurrentWindow } from "@tauri-apps/api/window";
import { openUrl } from "@tauri-apps/plugin-opener";
import { useEffect } from "react";

import { toggleMaximize } from "#/core/tauri/WindowChrome";
import { isTauri } from "#/helpers/device";
import { isExternalUrl } from "#/helpers/url";

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
 * WebKitGTK ignores `target="_blank"` and `window.open`, so external
 * links must be explicitly forwarded to the system browser.
 *
 * Listens on document in the bubble phase so app handlers (like
 * LinkInterceptor routing lemmy links in-app) win via preventDefault.
 */
export default function TauriListener() {
  useEffect(() => {
    if (!isTauri()) return;

    function onClick(event: MouseEvent) {
      if (event.defaultPrevented) return;
      if (!(event.target instanceof Element)) return;

      const anchor = event.target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (!isExternalUrl(anchor.href)) return;

      event.preventDefault();
      openUrl(anchor.href);
    }

    // With native decorations off, empty header space is the titlebar
    // (drag to move, double-click to maximize)
    function onMouseDown(event: MouseEvent) {
      if (event.button !== 0) return;
      if (!(event.target instanceof Element)) return;
      if (!event.target.closest("ion-header")) return;
      if (event.target.closest(INTERACTIVE_SELECTOR)) return;

      if (event.detail === 2) {
        toggleMaximize();
      } else {
        getCurrentWindow().startDragging();
      }
    }

    const originalOpen = window.open.bind(window);

    function tauriOpen(
      url?: string | URL,
      target?: string,
      features?: string,
    ): Window | null {
      if (url && isExternalUrl(url.toString())) {
        openUrl(url.toString());
        return null;
      }

      return originalOpen(url, target, features);
    }

    document.addEventListener("click", onClick);
    document.addEventListener("mousedown", onMouseDown);
    window.open = tauriOpen;

    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("mousedown", onMouseDown);
      window.open = originalOpen;
    };
  }, []);

  return null;
}
