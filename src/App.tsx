import { IonApp, setupIonicReact } from "@ionic/react";
import { createMemoryHistory } from "history";

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

/* Theme variables */
import "./theme/variables.css";
import { Provider } from "react-redux";
import store from "./store";
import ThemeColorUpdater from "./ThemeColorUpdater";
import { isInstalled } from "./helpers/device";
import React, { useEffect } from "react";
import Tabs from "./Tabs";
import Auth from "./Auth";
import { AppContextProvider } from "./features/auth/AppContext";
import { IonReactMemoryRouter, IonReactRouter } from "@ionic/react-router";

setupIonicReact({
  rippleEffect: false,
  mode: "ios",
  swipeBackEnabled: isInstalled(),
});

function Router({ children }: { children: React.ReactNode }) {
  const history = createMemoryHistory();

  useEffect(() => {
    const unListen = history.listen(() => {
      window.scrollTo(0, 0);
    });
    return () => {
      unListen();
    };
  }, []);

  if (isInstalled())
    return (
      <IonReactMemoryRouter history={history}>{children}</IonReactMemoryRouter>
    );

  return <IonReactRouter>{children}</IonReactRouter>;
}

export default function App() {
  return (
    <AppContextProvider>
      <ThemeColorUpdater />
      <Provider store={store}>
        <IonApp>
          <Router>
            <Auth>
              <Tabs />
            </Auth>
          </Router>
        </IonApp>
      </Provider>
    </AppContextProvider>
  );
}
