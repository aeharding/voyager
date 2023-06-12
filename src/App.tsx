import { Redirect, Route } from "react-router-dom";
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
import Home from "./pages/Home";
import Tab2 from "./pages/Tab2";
import Tab3 from "./pages/Tab3";
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

import "./App.css";

/* Theme variables */
import "./theme/variables.css";
import PostDetail from "./components/PostDetail";
import { Provider } from "react-redux";
import store from "./store";
import ThemeColorUpdater from "./ThemeColorUpdater";
import { isInstalled } from "./helpers/device";
import Communities from "./pages/Communities";
import Community from "./pages/Community";

setupIonicReact({
  rippleEffect: false,
  mode: "ios",
  swipeBackEnabled: isInstalled(),
});

function Router({ children }: { children: React.ReactNode }) {
  const history = createMemoryHistory();

  if (isInstalled())
    return (
      <IonReactMemoryRouter history={history}>{children}</IonReactMemoryRouter>
    );

  return <IonReactRouter>{children}</IonReactRouter>;
}

const DEFAULT_ACTOR = "lemmy.ml";

function App() {
  return (
    <>
      <ThemeColorUpdater />
      <Provider store={store}>
        <IonApp>
          <Router>
            <IonTabs>
              <IonRouterOutlet>
                <Route exact path="/">
                  <Redirect to={`/${DEFAULT_ACTOR}/home`} />
                </Route>
                <Route exact path="/:actor/communities">
                  <Communities />
                </Route>
                <Route
                  exact
                  path="/:actor/"
                  render={(props) => (
                    <Redirect to={`/${props.match.params.actor}/home`} />
                  )}
                ></Route>
                <Route exact path="/:actor/home">
                  <Home />
                </Route>
                <Route exact path="/:actor/c/:community">
                  <Community />
                </Route>
                <Route exact path="/:actor/c/:community/comments/:id">
                  <PostDetail />
                </Route>
                <Route exact path="/tab2">
                  <Tab2 />
                </Route>
                <Route path="/tab3">
                  <Tab3 />
                </Route>
              </IonRouterOutlet>
              <IonTabBar slot="bottom">
                <IonTabButton tab="posts" href={`/${DEFAULT_ACTOR}/home`}>
                  <IonIcon aria-hidden="true" icon={logoWebComponent} />
                  <IonLabel>Posts</IonLabel>
                </IonTabButton>
                <IonTabButton tab="tab2" href="/tab2">
                  <IonIcon aria-hidden="true" icon={person} />
                  <IonLabel>lemmy_user</IonLabel>
                </IonTabButton>
                <IonTabButton tab="tab3" href="/tab3">
                  <IonIcon aria-hidden="true" icon={settings} />
                  <IonLabel>Settings</IonLabel>
                </IonTabButton>
              </IonTabBar>
            </IonTabs>
          </Router>
        </IonApp>
      </Provider>
    </>
  );
}

export default App;
