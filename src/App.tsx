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
import { getAndroidNavMode, isInstalled } from "./helpers/device";
import TabbedRoutes from "./TabbedRoutes";
import Auth from "./Auth";
import { AppContextProvider } from "./features/auth/AppContext";
import Router from "./Router";
import BeforeInstallPromptProvider from "./BeforeInstallPromptProvider";
import { UpdateContextProvider } from "./pages/settings/update/UpdateContext";
import GlobalStyles from "./GlobalStyles";
import ConfigProvider from "./services/app";
import { getDeviceMode } from "./features/settings/settingsSlice";
import { TabContextProvider } from "./TabContext";
import { NavModes } from "capacitor-android-nav-mode";
import { TextRecoveryStartupPrompt } from "./helpers/useTextRecovery";
import { ErrorBoundary } from "react-error-boundary";
import AppCrash from "./AppCrash";

import "./listeners";

// index.tsx ensures android nav mode resolves before app is rendered
(async () => {
  let navMode;
  try {
    navMode = await getAndroidNavMode();
  } catch (e) {
    // ignore errors
  }

  setupIonicReact({
    rippleEffect: false,
    mode: getDeviceMode(),
    statusTap: false, // custom implementation listeners/statusTap.ts
    swipeBackEnabled:
      isInstalled() &&
      getDeviceMode() === "ios" &&
      navMode !== NavModes.Gesture,
  });
})();

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
                    <ErrorBoundary FallbackComponent={AppCrash}>
                      <TabContextProvider>
                        <TextRecoveryStartupPrompt />
                        <Auth>
                          <TabbedRoutes />
                        </Auth>
                      </TabContextProvider>
                    </ErrorBoundary>
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
