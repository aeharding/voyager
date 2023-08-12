import { useEffect, useState } from "react";
import { Keyboard } from "@capacitor/keyboard";
import { isAndroid, isNative } from "./device";
import BooleanWatcher from "./BooleanWatcher";

const keyboardWatcher = new BooleanWatcher(false);

Keyboard.addListener("keyboardWillShow", () => keyboardWatcher.setValue(true));
Keyboard.addListener("keyboardWillShow", () => keyboardWatcher.setValue(false));

export default function useKeyboardOpen() {
  const [keyboardOpen, setKeyboardOpen] = useState(
    keyboardWatcher.getValue() ?? false
  );

  useEffect(() => {
    const nativeListener = (open: boolean) => setKeyboardOpen(open);

    if (isNative() && isAndroid()) {
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
