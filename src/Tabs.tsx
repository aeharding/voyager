import {
  Redirect,
  Route,
  useHistory,
  useLocation,
  useParams,
} from "react-router-dom";
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
  useIonRouter,
} from "@ionic/react";
import {
  logoWebComponent,
  settings,
  person,
  albumsOutline,
  globeOutline,
  telescopeSharp,
} from "ionicons/icons";
import Home from "./pages/Home";
import Tab2 from "./pages/Tab2";
import Tab3 from "./pages/Tab3";
import PostDetail from "./components/PostDetail";
import Communities from "./pages/Communities";
import Community from "./pages/Community";
import { useAppSelector } from "./store";
import { handleSelector } from "./features/auth/authSlice";

const DEFAULT_ACTOR = "lemmy.ml";

export default function Tabs() {
  const location = useLocation();
  const router = useIonRouter();

  const handle = useAppSelector(handleSelector);

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path="/">
          <Redirect to={`/${DEFAULT_ACTOR}/home`} />
        </Route>
        <Route exact path="/:actor/home">
          <Home />
        </Route>
        <Route exact path="/:actor">
          <Communities />
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
        <IonTabButton
          tab="posts"
          selected={
            !location.pathname.startsWith("/tab2") &&
            !location.pathname.startsWith("/tab3")
          }
          onClick={() => {
            // Hacks on hacks on hacks
            const pages = document.querySelectorAll(
              "div.ion-page:not(.ion-page.hidden)"
            );
            const page = pages[pages.length - 1];
            const scroll =
              page.querySelector('[data-virtuoso-scroller="true"]') ??
              page
                .querySelector("ion-content")
                ?.shadowRoot?.querySelector(".inner-scroll");

            if (scroll?.scrollTop) {
              scroll.scrollTo({ top: 0, behavior: "smooth" });
              return;
            }

            if (location.pathname.endsWith("/home")) {
              router.push(`/${DEFAULT_ACTOR}`, "back");
              return;
            }
            if (location.pathname === `/${DEFAULT_ACTOR}`) return;

            router.push(`/${DEFAULT_ACTOR}/home`, "back");
          }}
        >
          <IonIcon aria-hidden="true" icon={telescopeSharp} />
          <IonLabel>Posts</IonLabel>
        </IonTabButton>
        <IonTabButton tab="tab2" href="/tab2">
          <IonIcon aria-hidden="true" icon={person} />
          <IonLabel>{handle}</IonLabel>
        </IonTabButton>
        <IonTabButton tab="tab3" href="/tab3">
          <IonIcon aria-hidden="true" icon={settings} />
          <IonLabel>Settings</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
}
