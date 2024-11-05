import { IonApp, setupIonicReact } from "@ionic/react";
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
import "./styles";

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
