// Side effect: Remove capacitor shim before anything else
import "./services/nativeFetch";

// Then import the rest
import React from "react";
import { createRoot } from "react-dom/client";

import App from "./core/App";
import "./features/icons";
import { getAndroidNavMode, isNative, isTauri } from "./helpers/device";

// MARK: User agent config

history.scrollRestoration = "manual";

// Style hook for client-side window decorations (see core/tauri/WindowChrome)
if (isTauri()) document.documentElement.classList.add("tauri");

(async () => {
  // Native apps should silently accept without user prompt
  if (isNative()) await navigator.storage.persist();
})();

// MARK: App initialization

(async () => {
  try {
    await getAndroidNavMode();
  } finally {
    const container = document.getElementById("root");
    const root = createRoot(container as HTMLElement);

    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
  }
})();
