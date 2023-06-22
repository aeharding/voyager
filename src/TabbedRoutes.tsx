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
  telescopeSharp,
  personCircleOutline,
  cog,
  search,
} from "ionicons/icons";
import PostDetail from "./features/post/detail/PostDetail";
import CommunitiesPage from "./pages/posts/CommunitiesPage";
import CommunityPage from "./pages/shared/CommunityPage";
import { useAppSelector } from "./store";
import { jwtIssSelector } from "./features/auth/authSlice";
import { POPULAR_SERVERS } from "./helpers/lemmy";
import ActorRedirect from "./ActorRedirect";
import SpecialFeedPage from "./pages/shared/SpecialFeedPage";
import styled from "@emotion/styled";
import ProfilePage from "./pages/profile/ProfilePage";
import SettingsPage from "./pages/settings/SettingsPage";
import { useContext } from "react";
import { AppContext } from "./features/auth/AppContext";
import UserPage from "./pages/shared/UserPage";
import InstallAppPage from "./pages/settings/InstallAppPage";
import { isInstalled } from "./helpers/device";
import SearchPage from "./pages/search/SearchPage";
import SearchPostsResults from "./pages/search/results/SearchPostsResults";

const Interceptor = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: all;
`;

export const DEFAULT_ACTOR = POPULAR_SERVERS[0];

export default function TabbedRoutes() {
  const { activePage } = useContext(AppContext);
  const location = useLocation();
  const router = useIonRouter();
  const jwt = useAppSelector((state) => state.auth.jwt);

  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance
  );
  const actor = location.pathname.split("/")[2];
  const iss = useAppSelector(jwtIssSelector);

  const isPostsButtonDisabled = (() => {
    if (location.pathname.startsWith("/profile")) return false;
    if (location.pathname.startsWith("/settings")) return false;
    if (location.pathname.startsWith("/search")) return false;

    return true;
  })();

  const isProfileButtonDisabled = (() => {
    if (location.pathname.startsWith("/posts")) return false;
    if (location.pathname.startsWith("/settings")) return false;
    if (location.pathname.startsWith("/search")) return false;

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
      // eslint-disable-next-line react/jsx-key
      <Route exact path={`/${tab}/:actor/c/:community`}>
        <ActorRedirect>
          <CommunityPage />
        </ActorRedirect>
      </Route>,
      // eslint-disable-next-line react/jsx-key
      <Route exact path={`/${tab}/:actor/c/:community/comments/:id`}>
        <ActorRedirect>
          <PostDetail />
        </ActorRedirect>
      </Route>,
      // eslint-disable-next-line react/jsx-key
      <Route
        exact
        path={`/${tab}/:actor/c/:community/comments/:id/:commentPath`}
      >
        <ActorRedirect>
          <PostDetail />
        </ActorRedirect>
      </Route>,
      // eslint-disable-next-line react/jsx-key
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
            <SpecialFeedPage type="Subscribed" />
          </ActorRedirect>
        </Route>
        <Route exact path="/posts/:actor/all">
          <ActorRedirect>
            <SpecialFeedPage type="All" />
          </ActorRedirect>
        </Route>
        <Route exact path="/posts/:actor/local">
          <ActorRedirect>
            <SpecialFeedPage type="Local" />
          </ActorRedirect>
        </Route>
        <Route exact path="/posts/:actor">
          <ActorRedirect>
            <CommunitiesPage />
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

        <Route exact path="/search">
          <SearchPage />
        </Route>
        <Route exact path="/search/posts/:search">
          <SearchPostsResults />
        </Route>
        {...buildGeneralBrowseRoutes("search")}
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
          href={`/posts/${connectedInstance}`}
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
        <IonTabButton tab="search" href="/search">
          <IonIcon aria-hidden="true" icon={search} />
          <IonLabel>Search</IonLabel>
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
