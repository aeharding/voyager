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
  personCircleOutline,
  cog,
  search,
  fileTray,
  telescope,
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
import SearchPostsResultsPage from "./pages/search/results/SearchFeedResultsPage";
import ProfileFeedItemsPage from "./pages/profile/ProfileFeedItemsPage";
import SearchCommunitiesPage from "./pages/search/results/SearchCommunitiesPage";
import TermsPage from "./pages/settings/TermsPage";
import BoxesPage from "./pages/inbox/BoxesPage";
import { totalUnreadSelector } from "./features/inbox/inboxSlice";
import MentionsPage from "./pages/inbox/MentionsPage";
import RepliesPage from "./pages/inbox/RepliesPage";

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
  const totalUnread = useAppSelector(totalUnreadSelector);

  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance
  );
  const actor = location.pathname.split("/")[2];
  const iss = useAppSelector(jwtIssSelector);

  const isPostsButtonDisabled = location.pathname.startsWith("/posts");
  const isProfileButtonDisabled = location.pathname.startsWith("/profile");
  const isSearchButtonDisabled = location.pathname.startsWith("/search");

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

  async function onSearchClick() {
    if (!isSearchButtonDisabled) return;

    if (await scrollUpIfNeeded()) return;

    router.push(`/search`, "back");
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
            activePage.current?.scrollTo({
              top: 0,
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
      // eslint-disable-next-line react/jsx-key
      <Route exact path={`/${tab}/:actor/u/:handle/posts`}>
        <ActorRedirect>
          <ProfileFeedItemsPage type="Posts" />
        </ActorRedirect>
      </Route>,
      // eslint-disable-next-line react/jsx-key
      <Route exact path={`/${tab}/:actor/u/:handle/comments`}>
        <ActorRedirect>
          <ProfileFeedItemsPage type="Comments" />
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

        <Route exact path="/inbox">
          <BoxesPage />
        </Route>
        <Route exact path="/inbox/mentions">
          <MentionsPage />
        </Route>
        <Route exact path="/inbox/comment-replies">
          <RepliesPage type="Comment" />
        </Route>
        <Route exact path="/inbox/post-replies">
          <RepliesPage type="Post" />
        </Route>
        {...buildGeneralBrowseRoutes("inbox")}

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
          <SearchPostsResultsPage type="Posts" />
        </Route>
        <Route exact path="/search/comments/:search">
          <SearchPostsResultsPage type="Comments" />
        </Route>
        <Route exact path="/search/communities/:search">
          <SearchCommunitiesPage />
        </Route>
        {...buildGeneralBrowseRoutes("search")}
        <Route exact path="/search/:actor">
          <Redirect to="/search" push={false} />
        </Route>
        <Route exact path="/settings">
          <SettingsPage />
        </Route>
        <Route exact path="/settings/terms">
          <TermsPage />
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
          <IonIcon aria-hidden="true" icon={telescope} />
          <IonLabel>Posts</IonLabel>
          <Interceptor onClick={onPostsClick} />
        </IonTabButton>
        <IonTabButton
          // disabled={isSearchButtonDisabled}
          tab="inbox"
          href="/inbox"
        >
          <IonIcon aria-hidden="true" icon={fileTray} />
          <IonLabel>Inbox</IonLabel>
          <Interceptor onClick={onSearchClick} />
          {totalUnread ? (
            <IonBadge color="danger">{totalUnread}</IonBadge>
          ) : undefined}
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
        <IonTabButton
          disabled={isSearchButtonDisabled}
          tab="search"
          href="/search"
        >
          <IonIcon aria-hidden="true" icon={search} />
          <IonLabel>Search</IonLabel>
          <Interceptor onClick={onSearchClick} />
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
