import { Redirect, Route, useLocation } from "react-router-dom";
import {
  IonBadge,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  useIonRouter,
} from "@ionic/react";
import {
  settings,
  telescopeSharp,
  personCircleOutline,
  cog,
} from "ionicons/icons";
import PostDetail from "./components/PostDetail";
import Communities from "./pages/Communities";
import Community from "./pages/Community";
import { useAppSelector } from "./store";
import { jwtIssSelector } from "./features/auth/authSlice";
import { SUPPORTED_SERVERS } from "./helpers/lemmy";
import ActorRedirect from "./ActorRedirect";
import SpecialFeedPage from "./pages/SpecialFeedPage";
import { ListingType } from "lemmy-js-client";
import styled from "@emotion/styled";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import { useContext } from "react";
import { AppContext } from "./features/auth/AppContext";
import UserPage from "./pages/UserPage";
import InstallAppPage from "./pages/settings/InstallAppPage";
import { isInstalled } from "./helpers/device";

const Interceptor = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: all;
`;

export const DEFAULT_ACTOR = SUPPORTED_SERVERS[0];

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
    if (location.pathname.startsWith("/profile")) return false;
    if (location.pathname === "/settings") return false;

    return true;
  })();

  const isProfileButtonDisabled = (() => {
    if (location.pathname.startsWith("/posts")) return false;
    if (location.pathname === "/settings") return false;

    return true;
  })();

  async function onPostsClick() {
    if (!isPostsButtonDisabled) return;

    if (await scrollUpIfNeeded()) return;

    if (location.pathname.endsWith(jwt ? "/home" : "/all")) {
      router.push(`/posts/${actor ?? iss ?? DEFAULT_ACTOR}`, "back");
      return;
    }
    if (location.pathname === `/posts/${actor ?? iss ?? DEFAULT_ACTOR}`) return;

    if (router.canGoBack()) {
      router.goBack();
    } else {
      router.push(
        `/posts/${actor ?? iss ?? DEFAULT_ACTOR}/${jwt ? "home" : "all"}`,
        "back"
      );
    }
  }

  async function onProfileClick() {
    if (!isProfileButtonDisabled) return;

    if (await scrollUpIfNeeded()) return;

    router.push("/profile", "back");
  }

  async function scrollUpIfNeeded() {
    if (!activePage) return false;

    if ("querySelector" in activePage) {
      const scroll =
        activePage?.querySelector('[data-virtuoso-scroller="true"]') ??
        activePage
          ?.querySelector("ion-content")
          ?.shadowRoot?.querySelector(".inner-scroll");

      if (scroll?.scrollTop) {
        scroll.scrollTo({ top: 0, behavior: "smooth" });
        return true;
      }
    } else {
      return new Promise((resolve) =>
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
    }
  }

  function buildGeneralBrowseRoutes(tab: string) {
    return [
      <Route exact path={`/${tab}/:actor/c/:community`}>
        <ActorRedirect>
          <Community />
        </ActorRedirect>
      </Route>,
      <Route exact path={`/${tab}/:actor/c/:community/comments/:id`}>
        <ActorRedirect>
          <PostDetail />
        </ActorRedirect>
      </Route>,
      <Route
        exact
        path={`/${tab}/:actor/c/:community/comments/:id/:commentPath`}
      >
        <ActorRedirect>
          <PostDetail />
        </ActorRedirect>
      </Route>,
      <Route exact path={`/${tab}/:actor/u/:handle`}>
        <ActorRedirect>
          <UserPage />
        </ActorRedirect>
      </Route>,
    ];
  }

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path="/">
          <Redirect
            to={`/posts/${iss ?? DEFAULT_ACTOR}/${iss ? "home" : "all"}`}
            push={false}
          />
        </Route>
        <Route exact path="/posts/:actor/home">
          <ActorRedirect>
            <SpecialFeedPage type={ListingType.Subscribed} />
          </ActorRedirect>
        </Route>
        <Route exact path="/posts/:actor/all">
          <ActorRedirect>
            <SpecialFeedPage type={ListingType.All} />
          </ActorRedirect>
        </Route>
        <Route exact path="/posts/:actor/local">
          <ActorRedirect>
            <SpecialFeedPage type={ListingType.Local} />
          </ActorRedirect>
        </Route>
        <Route exact path={`/posts/:actor`}>
          <ActorRedirect>
            <Communities />
          </ActorRedirect>
        </Route>
        {...buildGeneralBrowseRoutes("posts")}

        <Route exact path="/profile">
          <ProfilePage />
        </Route>
        {...buildGeneralBrowseRoutes("profile")}

        <Route exact path="/profile/:actor">
          <Redirect to="/profile" push={false} />
        </Route>

        <Route exact path="/settings">
          <SettingsPage />
        </Route>
        <Route exact path="/settings/install">
          <InstallAppPage />
        </Route>
      </IonRouterOutlet>
      <IonTabBar slot="bottom">
        <IonTabButton
          disabled={isPostsButtonDisabled}
          tab="posts"
          href={`/posts/${iss ?? actor ?? DEFAULT_ACTOR}`}
        >
          <IonIcon aria-hidden="true" icon={telescopeSharp} />
          <IonLabel>Posts</IonLabel>
          <Interceptor onClick={onPostsClick} />
        </IonTabButton>
        <IonTabButton
          disabled={isProfileButtonDisabled}
          tab="profile"
          href="/profile"
        >
          <IonIcon aria-hidden="true" icon={personCircleOutline} />
          <IonLabel>{connectedInstance}</IonLabel>
          <Interceptor onClick={onProfileClick} />
        </IonTabButton>
        <IonTabButton tab="settings" href="/settings">
          <IonIcon aria-hidden="true" icon={cog} />
          <IonLabel>Settings</IonLabel>
          {!isInstalled() && <IonBadge color="danger">1</IonBadge>}
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
}
