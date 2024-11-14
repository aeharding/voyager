// Core CSS required for Ionic components to work properly
import "@ionic/react/css/core.css";

// Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

// Optional CSS utils that can be commented out
import "@ionic/react/css/display.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";

// Override Ionic variables
import "./theme/variables.css";
// Light mode
import "./theme/lightVariables.css";
// Dark mode
import "./theme/darkVariables.css";
// Dark mode modifier
import "./theme/darkModifierVariables.css";

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
import { AppToastProvider } from "#/helpers/useAppToast";
import { OptimizedRouterProvider } from "#/helpers/useOptimizedIonRouter";
import Router from "#/routes/common/Router";
import { UpdateContextProvider } from "#/routes/pages/settings/update/UpdateContext";
import ConfigProvider from "#/services/app";
import { StoreProvider } from "#/store";

import AppCrash from "./AppCrash";
import GlobalStyles from "./GlobalStyles";
import { TabContextProvider } from "./TabContext";

// preserve lexical order
import TabbedRoutes from "#/routes/TabbedRoutes";

import Auth from "./Auth";
import Listeners from "./listeners";

// Setup global app lifecycle listeners
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
                        <AppToastProvider>
                          <IonApp>
                            <Auth>
                              <TabbedRoutes>
                                <Listeners />
                              </TabbedRoutes>
                            </Auth>
                          </IonApp>
                        </AppToastProvider>
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
