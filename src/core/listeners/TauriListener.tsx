import { openUrl } from "@tauri-apps/plugin-opener";
import { useEffect } from "react";

import { isTauri } from "#/helpers/device";
import { isExternalUrl } from "#/helpers/url";

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
    window.open = tauriOpen;

    return () => {
      document.removeEventListener("click", onClick);
      window.open = originalOpen;
    };
  }, []);

  return null;
}
