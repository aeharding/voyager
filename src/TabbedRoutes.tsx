import { Redirect, Route } from "react-router-dom";
import { IonRouterOutlet, IonTabs } from "@ionic/react";
import PostDetail from "./pages/posts/PostPage";
import CommunitiesPage from "./pages/posts/CommunitiesPage";
import CommunityPage from "./pages/shared/CommunityPage";
import { useAppSelector } from "./store";
import { jwtIssSelector } from "./features/auth/authSlice";
import ActorRedirect from "./ActorRedirect";
import SpecialFeedPage from "./pages/shared/SpecialFeedPage";
import UserPage from "./pages/profile/UserPage";
import SettingsPage from "./pages/settings/SettingsPage";
import { useMemo, useRef } from "react";
import InstallAppPage from "./pages/settings/InstallAppPage";
import SearchPage from "./pages/search/SearchPage";
import SearchPostsResultsPage from "./pages/search/results/SearchFeedResultsPage";
import ProfileFeedItemsPage from "./pages/profile/ProfileFeedItemsPage";
import SearchCommunitiesPage from "./pages/search/results/SearchCommunitiesPage";
import TermsPage from "./pages/settings/TermsPage";
import BoxesPage from "./pages/inbox/BoxesPage";
import MentionsPage from "./pages/inbox/MentionsPage";
import RepliesPage from "./pages/inbox/RepliesPage";
import MessagesPage from "./pages/inbox/MessagesPage";
import ConversationPage from "./pages/inbox/ConversationPage";
import InboxPage from "./pages/inbox/InboxPage";
import { IonRouterOutletCustomEvent } from "@ionic/core";
import InboxAuthRequired from "./pages/inbox/InboxAuthRequired";
import UpdateAppPage from "./pages/settings/UpdateAppPage";
import AppearancePage from "./pages/settings/AppearancePage";
import CommunitySidebarPage from "./pages/shared/CommunitySidebarPage";
import RedditMigratePage from "./pages/settings/RedditDataMigratePage";
import ProfilePage from "./pages/profile/ProfilePage";
import ProfileFeedHiddenPostsPage from "./pages/profile/ProfileFeedHiddenPostsPage";
import { PageContextProvider } from "./features/auth/PageContext";
import GesturesPage from "./pages/settings/GesturesPage";
import BlocksSettingsPage from "./pages/settings/BlocksSettingsPage";
import { getDefaultServer } from "./services/app";
import GeneralPage from "./pages/settings/GeneralPage";
import HidingSettingsPage from "./pages/settings/HidingSettingsPage";
import DeviceModeSettingsPage from "./pages/settings/DeviceModeSettingsPage";
import InstanceSidebarPage from "./pages/shared/InstanceSidebarPage";
import AppearanceThemePage from "./pages/settings/AppearanceThemePage";
import GalleryProvider from "./features/gallery/GalleryProvider";
import AppIconPage from "./pages/settings/AppIconPage";
import { DefaultFeedType, ODefaultFeedType } from "./services/db";
import SearchFeedResultsPage from "./pages/search/results/SearchFeedResultsPage";
import AboutPage from "./pages/settings/about/AboutPage";
import AboutThanksPage from "./pages/settings/about/AboutThanksPage";
import BiometricPage from "./pages/settings/BiometricPage";
import CommunityCommentsPage from "./pages/shared/CommunityCommentsPage";
import CommentsPage from "./pages/shared/CommentsPage";
import ModlogPage from "./pages/shared/ModlogPage";
import ModqueuePage from "./pages/shared/ModqueuePage";
import TabBar from "./TabBar";
import { isInstalled } from "./helpers/device";
import { getBaseRoute } from "./features/community/list/CommunitiesListRedirectBootstrapper";

export default function TabbedRoutes() {
  const ready = useAppSelector((state) => state.settings.ready);
  const defaultFeed = useAppSelector(
    (state) => state.settings.general.defaultFeed,
  );
  const iss = useAppSelector(jwtIssSelector);

  const pageRef = useRef<IonRouterOutletCustomEvent<unknown>["target"]>(null);

  function buildGeneralBrowseRoutes(tab: string) {
    return [
      // eslint-disable-next-line react/jsx-key
      <Route exact path={`/${tab}/:actor/c/:community`}>
        <ActorRedirect>
          <CommunityPage />
        </ActorRedirect>
      </Route>,
      // eslint-disable-next-line react/jsx-key
      <Route exact path={`/${tab}/:actor/c/:community/search/posts/:search`}>
        <ActorRedirect>
          <SearchFeedResultsPage type="Posts" />
        </ActorRedirect>
      </Route>,
      // eslint-disable-next-line react/jsx-key
      <Route exact path={`/${tab}/:actor/c/:community/search/comments/:search`}>
        <ActorRedirect>
          <SearchFeedResultsPage type="Comments" />
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
        path={`/${tab}/:actor/c/:community/comments/:id/thread/:threadCommentId`}
      >
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
      <Route exact path={`/${tab}/:actor/c/:community/comments`}>
        <ActorRedirect>
          <CommunityCommentsPage />
        </ActorRedirect>
      </Route>,
      // eslint-disable-next-line react/jsx-key
      <Route exact path={`/${tab}/:actor/c/:community/log`}>
        <ActorRedirect>
          <ModlogPage />
        </ActorRedirect>
      </Route>,
      // eslint-disable-next-line react/jsx-key
      <Route exact path={`/${tab}/:actor/c/:community/modqueue`}>
        <ActorRedirect>
          <ModqueuePage />
        </ActorRedirect>
      </Route>,
      // eslint-disable-next-line react/jsx-key
      <Route exact path={`/${tab}/:actor/mod/comments`}>
        <ActorRedirect>
          <CommentsPage type="ModeratorView" />
        </ActorRedirect>
      </Route>,
      // eslint-disable-next-line react/jsx-key
      <Route exact path={`/${tab}/:actor/mod/log`}>
        <ActorRedirect>
          <ModlogPage />
        </ActorRedirect>
      </Route>,
      // eslint-disable-next-line react/jsx-key
      <Route exact path={`/${tab}/:actor/mod/modqueue`}>
        <ActorRedirect>
          <ModqueuePage />
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
      // eslint-disable-next-line react/jsx-key
      <Route exact path={`/${tab}/:actor/sidebar`}>
        <ActorRedirect>
          <InstanceSidebarPage />
        </ActorRedirect>
      </Route>,
    ];
  }

  const pageContextValue = useMemo(() => ({ pageRef }), []);

  if (!ready) return;

  const redirectRoute = (() => {
    if (isInstalled()) return ""; // redirect to be handled by <CommunitiesListRedirectBootstrapper />

    return getBaseRoute(!!iss, defaultFeed);
  })();

  return (
    <PageContextProvider value={pageContextValue}>
      <GalleryProvider>
        {/* TODO key={} resets the tab route stack whenever your instance changes. */}
        {/* In the future, it would be really cool if we could resolve object urls to pick up where you left off */}
        {/* But this isn't trivial with needing to rewrite URLs... */}
        <IonTabs key={iss ?? getDefaultServer()}>
          <IonRouterOutlet ref={pageRef}>
            <Route exact path="/">
              {!iss || defaultFeed ? (
                <Redirect
                  to={`/posts/${iss ?? getDefaultServer()}${redirectRoute}`}
                  push={false}
                />
              ) : (
                ""
              )}
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
            <Route exact path="/posts/:actor/mod">
              <ActorRedirect>
                <SpecialFeedPage type="ModeratorView" />
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

            {...buildGeneralBrowseRoutes("settings")}
            <Route exact path="/settings/:actor">
              <Redirect to="/settings" push={false} />
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
            <Route exact path="/settings/general">
              <GeneralPage />
            </Route>
            <Route exact path="/settings/general/hiding">
              <HidingSettingsPage />
            </Route>
            <Route exact path="/settings/appearance">
              <AppearancePage />
            </Route>
            <Route exact path="/settings/appearance/theme">
              <AppearanceThemePage />
            </Route>
            <Route exact path="/settings/appearance/theme/mode">
              <DeviceModeSettingsPage />
            </Route>
            <Route exact path="/settings/app-icon">
              <AppIconPage />
            </Route>
            <Route exact path="/settings/biometric">
              <BiometricPage />
            </Route>
            <Route exact path="/settings/gestures">
              <GesturesPage />
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
            {/* This annoyingly cannot be /settings/about, because otherwise it will also match /settings/:actor */}
            <Route exact path="/settings/about/app">
              <AboutPage />
            </Route>
            <Route exact path="/settings/about/thanks">
              <AboutThanksPage />
            </Route>
          </IonRouterOutlet>

          <TabBar slot="bottom" />
        </IonTabs>
      </GalleryProvider>
    </PageContextProvider>
  );
}

export function getPathForFeed(defaultFeed: DefaultFeedType): string {
  switch (defaultFeed.type) {
    case ODefaultFeedType.All:
      return "/all";
    case ODefaultFeedType.Home:
      return "/home";
    case ODefaultFeedType.Local:
      return "/local";
    case ODefaultFeedType.Moderating:
      return "/mod";
    case ODefaultFeedType.CommunityList:
      return "";
    case ODefaultFeedType.Community:
      return `/c/${defaultFeed.name}`;
  }
}
