import { Keyboard } from "@capacitor/keyboard";
import { useEffect, useState } from "react";

import BooleanWatcher from "./BooleanWatcher";
import { getPlatform } from "./device";

const keyboardWatcher = new BooleanWatcher(false);

if (getPlatform() === "capacitor") {
  Keyboard.addListener("keyboardWillShow", () =>
    keyboardWatcher.setValue(true),
  );

  Keyboard.addListener("keyboardWillHide", () =>
    keyboardWatcher.setValue(false),
  );
}

export default function useKeyboardOpen() {
  const [keyboardOpen, setKeyboardOpen] = useState(
    keyboardWatcher.getValue() ?? false,
  );

  useEffect(() => {
    const nativeListener = (open: boolean) => setKeyboardOpen(open);

    if (getPlatform() === "capacitor") {
      keyboardWatcher.addEventListener(nativeListener);

      return () => {
        keyboardWatcher.removeEventListener(nativeListener);
      };
    }

    const updateViewport = () => {
      // For the rare legacy browsers that don't support it
      if (!window.visualViewport) {
        return;
      }
      setKeyboardOpen(!!(window.innerHeight - window.visualViewport.height));
    };

    const onResize = () => {
      updateViewport();
    };

    updateViewport();

    window.visualViewport?.addEventListener("resize", onResize);

    return () => {
      window.visualViewport?.removeEventListener("resize", onResize);
    };
  }, []);

  return keyboardOpen;
}
