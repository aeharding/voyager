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

import { Provider } from "react-redux";
import store from "./store";
import { isInstalled } from "./helpers/device";
import TabbedRoutes from "./TabbedRoutes";
import Auth from "./Auth";
import { AppContextProvider } from "./features/auth/AppContext";
import Router from "./Router";
import BeforeInstallPromptProvider from "./BeforeInstallPromptProvider";
import { UpdateContextProvider } from "./pages/settings/update/UpdateContext";
import GlobalStyles from "./GlobalStyles";

setupIonicReact({
  rippleEffect: false,
  mode: "ios",
  swipeBackEnabled: isInstalled(),
  hardwareBackButton: true,
});

export default function App() {
  return (
    <AppContextProvider>
      <Provider store={store}>
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
      </Provider>
    </AppContextProvider>
  );
}
