import { IonApp, setupIonicReact } from "@ionic/react";
import { StoreProvider } from "../store";
import { getAndroidNavMode, isInstalled } from "../helpers/device";
import TabbedRoutes from "../routes/TabbedRoutes";
import Auth from "./Auth";
import { AppContextProvider } from "../features/auth/AppContext";
import Router from "../routes/common/Router";
import BeforeInstallPromptProvider from "../features/pwa/BeforeInstallPromptProvider";
import { UpdateContextProvider } from "../routes/pages/settings/update/UpdateContext";
import GlobalStyles from "./GlobalStyles";
import ConfigProvider from "../services/app";
import { getDeviceMode } from "../features/settings/settingsSlice";
import { TabContextProvider } from "./TabContext";
import { NavModes } from "capacitor-android-nav-mode";
import { TextRecoveryStartupPrompt } from "../helpers/useTextRecovery";
import HapticsListener from "./listeners/HapticsListener";
import AndroidBackButton from "./listeners/AndroidBackButton";
import { OptimizedRouterProvider } from "../helpers/useOptimizedIonRouter";
import { ErrorBoundary } from "react-error-boundary";
import AppCrash from "./AppCrash";

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

/* Setup global app lifecycle listeners */
import "./listeners";
import AppUrlListener from "./listeners/AppUrlListener";
import { ResetStatusTap } from "./listeners/statusTap";

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
    <ErrorBoundary FallbackComponent={AppCrash}>
      <ConfigProvider>
        <AppContextProvider>
          <StoreProvider>
            <GlobalStyles>
              <BeforeInstallPromptProvider>
                <UpdateContextProvider>
                  <Router>
                    <OptimizedRouterProvider>
                      <AndroidBackButton />
                      <ResetStatusTap />

                      <TabContextProvider>
                        <IonApp>
                          <HapticsListener />
                          <AppUrlListener />
                          <TextRecoveryStartupPrompt />

                          <Auth>
                            <TabbedRoutes />
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
