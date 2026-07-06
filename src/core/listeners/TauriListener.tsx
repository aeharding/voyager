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
 * Listens in the capture phase (app handlers like Link.tsx stopPropagation,
 * so bubble never fires) but defers acting until app handlers have run —
 * preventDefault is still observable afterwards, so in-app routing
 * (LinkInterceptor resolving lemmy links) wins.
 */
export default function TauriListener() {
  useEffect(() => {
    if (!isTauri()) return;

    function onClick(event: MouseEvent) {
      if (event.defaultPrevented) return;

      // composedPath pierces shadow DOM (e.g. ion-item[href] internal anchor)
      const anchor = event
        .composedPath()
        .find(
          (el): el is HTMLAnchorElement =>
            el instanceof HTMLAnchorElement && el.hasAttribute("href"),
        );
      if (!anchor) return;
      if (!isExternalUrl(anchor.href)) return;

      // The webview must never navigate away from the app
      // (_blank is already a no-op in wry)
      if (!anchor.target) anchor.target = "_blank";

      queueMicrotask(() => {
        if (event.defaultPrevented) return;

        openUrl(anchor.href);
      });
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

    document.addEventListener("click", onClick, true);
    document.addEventListener("mousedown", onMouseDown);
    window.open = tauriOpen;

    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("mousedown", onMouseDown);
      window.open = originalOpen;
    };
  }, []);

  return null;
}
