import { isPlatform } from "@ionic/core";
import { Keyboard } from "@capacitor/keyboard";
import { isNative } from "../../helpers/device";

// Code from:
// https://github.com/ionic-team/capacitor/issues/1540#issuecomment-735221275
//
// Once the following issue is fixed:
// https://github.com/ionic-team/capacitor-plugins/issues/1904
//
// 1. Remove this code
// 2. Change capacitor.config.ts keyboard resize = "none" to "ionic"

if (isNative() && isPlatform("ios")) {
  Keyboard.addListener("keyboardWillShow", (e) => {
    const app = document.querySelector("ion-app");
    if (!(app instanceof HTMLElement)) return;

    app.style.marginBottom = `${e.keyboardHeight}px`;
  });

  Keyboard.addListener("keyboardWillHide", () => {
    const app = document.querySelector("ion-app");
    if (!(app instanceof HTMLElement)) return;

    app.style.marginBottom = "0px";
  });
}
