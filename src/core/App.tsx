import { IonApp, setupIonicReact } from "@ionic/react";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";
import "@ionic/react/css/display.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/float-elements.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/palettes/dark.class.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/typography.css";
import { NavModes } from "capacitor-android-nav-mode";
import { ErrorBoundary } from "react-error-boundary";

import { AppContextProvider } from "#/features/auth/AppContext";
import BeforeInstallPromptProvider from "#/features/pwa/BeforeInstallPromptProvider";
import {
  getAndroidNavMode,
  getDeviceMode,
  isInstalled,
} from "#/helpers/device";
import { OptimizedRouterProvider } from "#/helpers/useOptimizedIonRouter";
import Router from "#/routes/common/Router";
import { UpdateContextProvider } from "#/routes/pages/settings/update/UpdateContext";
import ConfigProvider from "#/services/app";
import { StoreProvider } from "#/store";

import AppCrash from "./AppCrash";
import GlobalStyles from "./GlobalStyles";
import IonAppContents from "./IonAppContents";
import { TabContextProvider } from "./TabContext";

/* Setup global app lifecycle listeners */
import "./listeners";

// index.tsx ensures android nav mode resolves before app is rendered
(async () => {
  let navMode;
  try {
    navMode = await getAndroidNavMode();
  } catch (_) {
    // ignore errors
  }

  setupIonicReact({
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
    <ErrorBoundary FallbackComponent={AppCrash}>
      <ConfigProvider>
        <AppContextProvider>
          <StoreProvider>
            <GlobalStyles>
              <BeforeInstallPromptProvider>
                <UpdateContextProvider>
                  <Router>
                    <OptimizedRouterProvider>
                      <TabContextProvider>
                        <IonApp>
                          <IonAppContents />
                        </IonApp>
                      </TabContextProvider>
                    </OptimizedRouterProvider>
                  </Router>
                </UpdateContextProvider>
              </BeforeInstallPromptProvider>
            </GlobalStyles>
          </StoreProvider>
        </AppContextProvider>
      </ConfigProvider>
    </ErrorBoundary>
  );
}
