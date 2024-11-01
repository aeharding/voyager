import React from "react";
import { createRoot } from "react-dom/client";
import App from "./core/App";
import { getAndroidNavMode, isNative } from "./helpers/device";
import "./core/globalCssOverrides";
import "./features/icons";

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

(async () => {
  // Native apps should silently accept without user prompt
  if (isNative()) await navigator.storage.persist();
})();
