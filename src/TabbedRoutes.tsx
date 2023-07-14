import styled from "@emotion/styled";
import { IonRouterOutletCustomEvent } from "@ionic/core";
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
  cog,
  fileTray,
  personCircleOutline,
  search,
  telescope,
} from "ionicons/icons";
import { useContext, useEffect, useRef } from "react";
import { Redirect, Route, useLocation } from "react-router-dom";
import ActorRedirect from "./ActorRedirect";
import { AppContext } from "./features/auth/AppContext";
import { PageContextProvider } from "./features/auth/PageContext";
import {
  handleSelector,
  jwtIssSelector,
  jwtSelector,
} from "./features/auth/authSlice";
import { getFavoriteCommunities } from "./features/community/communitySlice";
import { totalUnreadSelector } from "./features/inbox/inboxSlice";
import useShouldInstall from "./features/pwa/useShouldInstall";
import { LEMMY_SERVERS } from "./helpers/lemmy";
import { scrollUpIfNeeded } from "./helpers/scrollUpIfNeeded";
import BoxesPage from "./pages/inbox/BoxesPage";
import ConversationPage from "./pages/inbox/ConversationPage";
import InboxAuthRequired from "./pages/inbox/InboxAuthRequired";
import InboxPage from "./pages/inbox/InboxPage";
import MentionsPage from "./pages/inbox/MentionsPage";
import MessagesPage from "./pages/inbox/MessagesPage";
import RepliesPage from "./pages/inbox/RepliesPage";
import CommunitiesPage from "./pages/posts/CommunitiesPage";
import PostDetail from "./pages/posts/PostPage";
import ProfileFeedHiddenPostsPage from "./pages/profile/ProfileFeedHiddenPostsPage";
import ProfileFeedItemsPage from "./pages/profile/ProfileFeedItemsPage";
import ProfilePage from "./pages/profile/ProfilePage";
import UserPage from "./pages/profile/UserPage";
import ReportsPage from "./pages/reports/ReportBoxesPage";
import SearchPage, { focusSearchBar } from "./pages/search/SearchPage";
import SearchCommunitiesPage from "./pages/search/results/SearchCommunitiesPage";
import SearchPostsResultsPage from "./pages/search/results/SearchFeedResultsPage";
import AppearancePage from "./pages/settings/AppearancePage";
import BlocksSettingsPage from "./pages/settings/BlocksSettingsPage";
import InstallAppPage from "./pages/settings/InstallAppPage";
import RedditMigratePage from "./pages/settings/RedditDataMigratePage";
import SettingsPage from "./pages/settings/SettingsPage";
import TermsPage from "./pages/settings/TermsPage";
import UpdateAppPage from "./pages/settings/UpdateAppPage";
import { UpdateContext } from "./pages/settings/update/UpdateContext";
import CommunityPage from "./pages/shared/CommunityPage";
import CommunitySidebarPage from "./pages/shared/CommunitySidebarPage";
import SpecialFeedPage from "./pages/shared/SpecialFeedPage";
import { useAppDispatch, useAppSelector } from "./store";
import ReportAuthRequired from "./pages/reports/ReportsAuthRequired";

const Interceptor = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: all;
`;

export const DEFAULT_ACTOR = LEMMY_SERVERS[0];

export default function TabbedRoutes() {
  const { activePage } = useContext(AppContext);
  const location = useLocation();
  const router = useIonRouter();
  const jwt = useAppSelector(jwtSelector);
  const totalUnread = useAppSelector(totalUnreadSelector);
  const { status: updateStatus } = useContext(UpdateContext);
  const shouldInstall = useShouldInstall();
  const dispatch = useAppDispatch();
  const activeHandle = useAppSelector(handleSelector);

  const settingsNotificationCount =
    (shouldInstall ? 1 : 0) + (updateStatus === "outdated" ? 1 : 0);

  const pageRef = useRef<IonRouterOutletCustomEvent<unknown>["target"]>(null);

  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance
  );
  const actor = location.pathname.split("/")[2];
  const iss = useAppSelector(jwtIssSelector);

  const isPostsButtonDisabled = location.pathname.startsWith("/posts");
  const isInboxButtonDisabled = location.pathname.startsWith("/inbox");
  const isProfileButtonDisabled = location.pathname.startsWith("/profile");
  const isSearchButtonDisabled = location.pathname.startsWith("/search");

  useEffect(() => {
    dispatch(getFavoriteCommunities());
  }, [dispatch, activeHandle]);

  async function onPostsClick() {
    if (!isPostsButtonDisabled) return;

    if (await scrollUpIfNeeded(activePage)) return;

    if (location.pathname.endsWith(jwt ? "/home" : "/all")) {
      router.push(`/posts/${actor ?? iss ?? DEFAULT_ACTOR}`, "back");
      return;
    }

    const communitiesPath = `/posts/${actor ?? iss ?? DEFAULT_ACTOR}`;
    if (
      location.pathname === communitiesPath ||
      location.pathname === `${communitiesPath}/`
    )
      return;

    if (router.canGoBack()) {
      router.goBack();
    } else {
      router.push(
        `/posts/${actor ?? iss ?? DEFAULT_ACTOR}/${jwt ? "home" : "all"}`,
        "back"
      );
    }
  }

  async function onInboxClick() {
    if (!isInboxButtonDisabled) return;

    if (await scrollUpIfNeeded(activePage)) return;

    router.push(`/inbox`, "back");
  }
  async function onProfileClick() {
    if (!isProfileButtonDisabled) return;

    if (await scrollUpIfNeeded(activePage)) return;

    router.push("/profile", "back");
  }

  async function onSearchClick() {
    if (!isSearchButtonDisabled) return;

    // if the search page is already open, focus the search bar
    focusSearchBar();

    if (await scrollUpIfNeeded(activePage)) return;

    router.push(`/search`, "back");
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
      <Route exact path={`/${tab}/:actor/c/:community/sidebar`}>
        <ActorRedirect>
          <CommunitySidebarPage />
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
      // eslint-disable-next-line react/jsx-key
      <Route exact path={`/${tab}/:actor/u/:handle/saved`}>
        <ActorRedirect>
          <ProfileFeedItemsPage type="Saved" />
        </ActorRedirect>
      </Route>,
      // eslint-disable-next-line react/jsx-key
      <Route exact path={`/${tab}/:actor/u/:handle/hidden`}>
        <ActorRedirect>
          <ProfileFeedHiddenPostsPage />
        </ActorRedirect>
      </Route>,
      // eslint-disable-next-line react/jsx-key
      <Route exact path={`/${tab}/:actor/u/:handle/message`}>
        <InboxAuthRequired>
          <ConversationPage />
        </InboxAuthRequired>
      </Route>,
    ];
  }

  return (
    <PageContextProvider value={{ page: pageRef.current as HTMLElement }}>
      {/* TODO key={} resets the tab route stack whenever your instance changes. */}
      {/* In the future, it would be really cool if we could resolve object urls to pick up where you left off */}
      {/* But this isn't trivial with needing to rewrite URLs... */}
      <IonTabs key={iss ?? DEFAULT_ACTOR}>
        <IonRouterOutlet ref={pageRef}>
          <Route exact path="/">
            <Redirect
              to={`/posts/${iss ?? DEFAULT_ACTOR}/${iss ? "home" : "all"}`}
              push={false}
            />
          </Route>
          <Route exact path="/reports">
            <ReportsPage />
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
          <Route exact path="/inbox/all">
            <InboxAuthRequired>
              <InboxPage showRead />
            </InboxAuthRequired>
          </Route>
          <Route exact path="/reports/posts">
            <ReportAuthRequired>
              <InboxPage showRead />
            </ReportAuthRequired>
          </Route>
          <Route exact path="/reports/comments">
            <ReportAuthRequired>
              <InboxPage showRead />
            </ReportAuthRequired>
          </Route>
          <Route exact path="/reports/private_messages">
            <ReportAuthRequired>
              <InboxPage showRead />
            </ReportAuthRequired>
          </Route>
          <Route exact path="/inbox/unread">
            <InboxAuthRequired>
              <InboxPage />
            </InboxAuthRequired>
          </Route>
          <Route exact path="/inbox/mentions">
            <InboxAuthRequired>
              <MentionsPage />
            </InboxAuthRequired>
          </Route>
          <Route exact path="/inbox/comment-replies">
            <InboxAuthRequired>
              <RepliesPage type="Comment" />
            </InboxAuthRequired>
          </Route>
          <Route exact path="/inbox/post-replies">
            <InboxAuthRequired>
              <RepliesPage type="Post" />
            </InboxAuthRequired>
          </Route>
          <Route exact path="/inbox/messages">
            <InboxAuthRequired>
              <MessagesPage />
            </InboxAuthRequired>
          </Route>
          <Route exact path="/inbox/messages/:handle">
            <InboxAuthRequired>
              <ConversationPage />
            </InboxAuthRequired>
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
          <Route exact path="/settings/update">
            <UpdateAppPage />
          </Route>
          <Route exact path="/settings/appearance">
            <AppearancePage />
          </Route>
          <Route exact path="/settings/blocks">
            <BlocksSettingsPage />
          </Route>
          <Route exact path="/settings/reddit-migrate">
            <RedditMigratePage />
          </Route>
          <Route exact path="/settings/reddit-migrate/:search">
            <SearchCommunitiesPage />
          </Route>
          {/* general routes for settings is only for reddit-migrate */}
          {...buildGeneralBrowseRoutes("settings")}
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
            disabled={isInboxButtonDisabled}
            tab="inbox"
            href="/inbox"
          >
            <IonIcon aria-hidden="true" icon={fileTray} />
            <IonLabel>Inbox</IonLabel>
            {totalUnread ? (
              <IonBadge color="danger">{totalUnread}</IonBadge>
            ) : undefined}
            <Interceptor onClick={onInboxClick} />
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
            {settingsNotificationCount ? (
              <IonBadge color="danger">{settingsNotificationCount}</IonBadge>
            ) : undefined}
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </PageContextProvider>
  );
}
