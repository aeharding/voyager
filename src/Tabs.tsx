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
import PostDetail from "./components/PostDetail";
import Communities from "./pages/Communities";
import Community from "./pages/Community";
import { useAppSelector } from "./store";
import { handleSelector, jwtIssSelector } from "./features/auth/authSlice";
import { SUPPORTED_SERVERS } from "./helpers/lemmy";
import ActorRedirect from "./ActorRedirect";
import SpecialFeed from "./pages/SpecialFeedPage";
import SpecialFeedPage from "./pages/SpecialFeedPage";
import { ListingType } from "lemmy-js-client";
import styled from "@emotion/styled";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import { useContext } from "react";
import { AppContext } from "./features/auth/AppContext";

const Interceptor = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: all;
`;

const DEFAULT_ACTOR = SUPPORTED_SERVERS[0];

export default function Tabs() {
  const { activePage } = useContext(AppContext);
  const location = useLocation();
  const router = useIonRouter();
  const jwt = useAppSelector((state) => state.auth.jwt);

  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance
  );
  const potentialActor = location.pathname.split("/")[2];
  const iss = useAppSelector(jwtIssSelector);
  const actor = SUPPORTED_SERVERS.includes(potentialActor)
    ? potentialActor
    : undefined;

  const isPostsButtonDisabled = (() => {
    if (location.pathname === "/profile") return false;
    if (location.pathname === "/settings") return false;

    return true;
  })();

  async function onPostsClick() {
    if (!isPostsButtonDisabled) return;

    if (activePage) {
      if ("querySelector" in activePage) {
        const scroll =
          activePage?.querySelector('[data-virtuoso-scroller="true"]') ??
          activePage
            ?.querySelector("ion-content")
            ?.shadowRoot?.querySelector(".inner-scroll");

        if (scroll?.scrollTop) {
          scroll.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
      } else {
        const scrolled = await new Promise((resolve) =>
          activePage.current?.getState((state) => {
            if (state.scrollTop) {
              activePage.current?.scrollToIndex({
                index: 0,
                behavior: "smooth",
              });
            }

            resolve(!!state.scrollTop);
          })
        );

        if (scrolled) return;
      }
    }

    if (location.pathname.endsWith(jwt ? "/home" : "/all")) {
      router.push(`/instance/${actor ?? iss ?? DEFAULT_ACTOR}`, "back");
      return;
    }
    if (location.pathname === `/instance/${actor ?? iss ?? DEFAULT_ACTOR}`)
      return;

    router.push(
      `/instance/${actor ?? iss ?? DEFAULT_ACTOR}/${jwt ? "home" : "all"}`,
      "back"
    );
  }

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path="/">
          <Redirect
            to={`/instance/${iss ?? DEFAULT_ACTOR}/${iss ? "home" : "all"}`}
            push={false}
          />
        </Route>
        <Route exact path="/instance/:actor/home">
          <ActorRedirect>
            <SpecialFeedPage type={ListingType.Subscribed} />
          </ActorRedirect>
        </Route>
        <Route exact path="/instance/:actor/all">
          <ActorRedirect>
            <SpecialFeedPage type={ListingType.All} />
          </ActorRedirect>
        </Route>
        <Route exact path="/instance/:actor/local">
          <ActorRedirect>
            <SpecialFeedPage type={ListingType.Local} />
          </ActorRedirect>
        </Route>
        <Route exact path="/instance/:actor">
          <ActorRedirect>
            <Communities />
          </ActorRedirect>
        </Route>
        <Route exact path="/instance/:actor/c/:community">
          <ActorRedirect>
            <Community />
          </ActorRedirect>
        </Route>
        <Route exact path="/instance/:actor/c/:community/comments/:id">
          <ActorRedirect>
            <PostDetail />
          </ActorRedirect>
        </Route>
        <Route exact path="/profile">
          <ProfilePage />
        </Route>
        <Route exact path="/settings">
          <SettingsPage />
        </Route>
      </IonRouterOutlet>
      <IonTabBar slot="bottom">
        <IonTabButton
          disabled={isPostsButtonDisabled}
          tab="instance"
          // onClick={onPostsClick}
          href={`/instance/${iss ?? actor ?? DEFAULT_ACTOR}`}
        >
          <IonIcon aria-hidden="true" icon={telescopeSharp} />
          <IonLabel>Posts</IonLabel>
          <Interceptor onClick={onPostsClick} />
        </IonTabButton>
        <IonTabButton tab="profile" href="/profile">
          <IonIcon aria-hidden="true" icon={person} />
          <IonLabel>{connectedInstance}</IonLabel>
        </IonTabButton>
        <IonTabButton tab="settings" href="/settings">
          <IonIcon aria-hidden="true" icon={settings} />
          <IonLabel>Settings</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
}
