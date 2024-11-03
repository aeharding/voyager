import { Keyboard } from "@capacitor/keyboard";
import { StatusBar } from "@capacitor/status-bar";
import { SafeArea, SafeAreaInsets } from "capacitor-plugin-safe-area";

import { isAndroid, isNative } from "#/helpers/device";

// Android safe area inset management is bad, we have to do it manually
if (isNative() && isAndroid()) {
  let keyboardShowing = false;

  const updateInsets = ({ insets }: SafeAreaInsets) => {
    for (const [key, value] of Object.entries(insets)) {
      document.documentElement.style.setProperty(
        `--ion-safe-area-${key}`,
        // if keyboard open, assume no safe area inset
        `${keyboardShowing && key === "bottom" ? 0 : value}px`,
      );
    }
  };

  SafeArea.getSafeAreaInsets().then(updateInsets);
  SafeArea.addListener("safeAreaChanged", updateInsets);
  StatusBar.setOverlaysWebView({ overlay: true });

  Keyboard.addListener("keyboardWillShow", () => {
    keyboardShowing = true;
    SafeArea.getSafeAreaInsets().then(updateInsets);
  });
  Keyboard.addListener("keyboardWillHide", () => {
    keyboardShowing = false;
    SafeArea.getSafeAreaInsets().then(updateInsets);
  });
}
