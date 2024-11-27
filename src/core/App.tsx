// Core CSS required for Ionic components to work properly
import "@ionic/react/css/core.css";
// Optional CSS utils that can be commented out
import "@ionic/react/css/display.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/float-elements.css";
// Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/padding.css";
// Define after ./theme/variables to override it
import "@ionic/react/css/palettes/dark.class.css";

// CSS imports
import "./syntaxHighlights.css";

// PhotoSwipe (before global overrides)
import "photoswipe/style.css";

// Global CSS overrides
import "./globalCssOverrides.css";

// Rest of imports after css
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
// preserve lexical order
import TabbedRoutes from "#/routes/TabbedRoutes";
import ConfigProvider from "#/services/app";
import { StoreProvider } from "#/store";

import AppCrash from "./AppCrash";
import Auth from "./Auth";
// Global CSS overrides
import "./globalCssOverrides.css";
import GlobalStyles from "./GlobalStyles";
import Listeners from "./listeners";
// Setup global app lifecycle listeners
import "./listeners";
// CSS imports
import "./syntaxHighlights.css";
import { TabContextProvider } from "./TabContext";
// Dark mode modifier
import "./theme/darkModifierVariables.css";
// Dark mode
import "./theme/darkVariables.css";
// Light mode
import "./theme/lightVariables.css";
// Override Ionic variables
import "./theme/variables.css";

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
                          <Auth>
                            <TabbedRoutes>
                              <Listeners />
                            </TabbedRoutes>
                          </Auth>
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
