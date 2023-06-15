import { Redirect, Route, useLocation } from "react-router-dom";
import {
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  useIonRouter,
} from "@ionic/react";
import { settings, person, telescopeSharp } from "ionicons/icons";
import Tab2 from "./pages/Tab2";
import Tab3 from "./pages/Tab3";
import PostDetail from "./components/PostDetail";
import Communities from "./pages/Communities";
import Community from "./pages/Community";
import { useAppSelector } from "./store";
import { handleSelector, jwtIssSelector } from "./features/auth/authSlice";
import { SUPPORTED_SERVERS } from "./helpers/lemmy";
import ActorRedirect from "./ActorRedirect";
import SpecialFeed from "./pages/SpecialFeedPage";
import SpecialFeedPage from "./pages/SpecialFeedPage";

const DEFAULT_ACTOR = SUPPORTED_SERVERS[0];

export default function Tabs() {
  const location = useLocation();
  const router = useIonRouter();
  const jwt = useAppSelector((state) => state.auth.jwt);

  const handle = useAppSelector(handleSelector);

  const potentialActor = location.pathname.split("/")[1];
  const iss = useAppSelector(jwtIssSelector);
  const actor = SUPPORTED_SERVERS.includes(potentialActor)
    ? potentialActor
    : undefined;

  function onPostsClick() {
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

    if (location.pathname.endsWith(jwt ? "/home" : "/all")) {
      router.push(`/${actor ?? iss ?? DEFAULT_ACTOR}`, "back");
      return;
    }
    if (location.pathname === `/${actor ?? iss ?? DEFAULT_ACTOR}`) return;

    router.push(
      `/${actor ?? iss ?? DEFAULT_ACTOR}/${jwt ? "home" : "all"}`,
      "back"
    );
  }

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path="/">
          <Redirect
            to={`/${iss ?? DEFAULT_ACTOR}/${iss ? "home" : "all"}`}
            push={false}
          />
        </Route>
        <Route exact path="/:actor/home">
          <ActorRedirect>
            <SpecialFeedPage type="Subscribed" />
          </ActorRedirect>
        </Route>
        <Route exact path="/:actor/all">
          <ActorRedirect>
            <SpecialFeedPage type="All" />
          </ActorRedirect>
        </Route>
        <Route exact path="/:actor/local">
          <ActorRedirect>
            <SpecialFeedPage type="Local" />
          </ActorRedirect>
        </Route>
        <Route exact path="/:actor">
          <ActorRedirect>
            <Communities />
          </ActorRedirect>
        </Route>
        <Route exact path="/:actor/c/:community">
          <ActorRedirect>
            <Community />
          </ActorRedirect>
        </Route>
        <Route exact path="/:actor/c/:community/comments/:id">
          <ActorRedirect>
            <PostDetail />
          </ActorRedirect>
        </Route>
        <Route exact path="/profile">
          <Tab2 />
        </Route>
        <Route exact path="/settings">
          <Tab3 />
        </Route>
      </IonRouterOutlet>
      <IonTabBar slot="bottom">
        <IonTabButton
          tab="posts"
          selected={
            location.pathname !== "/settings" &&
            location.pathname !== "/profile"
          }
          onClick={onPostsClick}
        >
          <IonIcon aria-hidden="true" icon={telescopeSharp} />
          <IonLabel>Posts</IonLabel>
        </IonTabButton>
        <IonTabButton tab="profile" href="/profile">
          <IonIcon aria-hidden="true" icon={person} />
          <IonLabel>{handle ?? actor}</IonLabel>
        </IonTabButton>
        <IonTabButton tab="settings" href="/settings">
          <IonIcon aria-hidden="true" icon={settings} />
          <IonLabel>Settings</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
}
