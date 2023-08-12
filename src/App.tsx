import { IonApp, setupIonicReact } from "@ionic/react";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

import { StoreProvider } from "./store";
import { isAndroid, isInstalled, isNative } from "./helpers/device";
import TabbedRoutes from "./TabbedRoutes";
import Auth from "./Auth";
import { AppContextProvider } from "./features/auth/AppContext";
import Router from "./Router";
import BeforeInstallPromptProvider from "./BeforeInstallPromptProvider";
import { UpdateContextProvider } from "./pages/settings/update/UpdateContext";
import GlobalStyles from "./GlobalStyles";
import ConfigProvider from "./services/app";
import { getDeviceMode } from "./features/settings/settingsSlice";
import { SafeArea, SafeAreaInsets } from "capacitor-plugin-safe-area";
import { StatusBar } from "@capacitor/status-bar";
import { Keyboard } from "@capacitor/keyboard";

setupIonicReact({
  rippleEffect: false,
  mode: getDeviceMode(),
  swipeBackEnabled: isInstalled() && getDeviceMode() === "ios",
});

// Android safe area inset management is bad, we have to do it manually
if (isNative() && isAndroid()) {
  let keyboardShowing = false;

  const updateInsets = ({ insets }: SafeAreaInsets) => {
    for (const [key, value] of Object.entries(insets)) {
      document.documentElement.style.setProperty(
        `--ion-safe-area-${key}`,
        // if keyboard open, assume no safe area inset
        `${keyboardShowing && key === "bottom" ? 0 : value}px`
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

export default function App() {
  return (
    <ConfigProvider>
      <AppContextProvider>
        <StoreProvider>
          <GlobalStyles>
            <BeforeInstallPromptProvider>
              <UpdateContextProvider>
                <Router>
                  <IonApp>
                    <Auth>
                      <TabbedRoutes />
                    </Auth>
                  </IonApp>
                </Router>
              </UpdateContextProvider>
            </BeforeInstallPromptProvider>
          </GlobalStyles>
        </StoreProvider>
      </AppContextProvider>
    </ConfigProvider>
  );
}
