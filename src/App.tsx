import { Redirect, Route, useHistory, useLocation } from "react-router-dom";
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from "@ionic/react";
import { IonReactMemoryRouter, IonReactRouter } from "@ionic/react-router";
import { logoWebComponent, settings, person } from "ionicons/icons";
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
import PostDetail from "./components/PostDetail";
import { Provider } from "react-redux";
import store, { useAppDispatch, useAppSelector } from "./store";
import ThemeColorUpdater from "./ThemeColorUpdater";
import { isInstalled } from "./helpers/device";
import Communities from "./pages/Communities";
import Community from "./pages/Community";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Tabs from "./Tabs";
import Login from "./features/auth/Login";
import { getSelf } from "./features/auth/authSlice";
import Auth from "./Auth";
import { AppContext } from "./features/auth/AppContext";
import { VirtuosoHandle } from "react-virtuoso";

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

function App() {
  const [activePage, setActivePage] = useState<
    HTMLElement | React.RefObject<VirtuosoHandle> | undefined
  >();

  return (
    <AppContext.Provider value={{ activePage, setActivePage }}>
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
    </AppContext.Provider>
  );
}

export default App;
