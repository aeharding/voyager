import { Redirect } from "react-router-dom";
import Route from "./Route";
import { IonRouterOutlet, IonTabs } from "@ionic/react";
import PostDetail from "./pages/posts/PostPage";
import CommunitiesPage from "./pages/posts/CommunitiesPage";
import CommunityPage from "./pages/shared/CommunityPage";
import { useAppSelector } from "./store";
import { instanceSelector } from "./features/auth/authSelectors";
import SpecialFeedPage from "./pages/shared/SpecialFeedPage";
import UserPage from "./pages/profile/UserPage";
import SettingsPage from "./pages/settings/SettingsPage";
import { forwardRef, useContext, useEffect, useMemo, useRef } from "react";
import InstallAppPage from "./pages/settings/InstallAppPage";
import SearchPage from "./pages/search/SearchPage";
import SearchPostsResultsPage from "./pages/search/results/SearchFeedResultsPage";
import ProfileFeedItemsPage from "./pages/profile/ProfileFeedItemsPage";
import SearchCommunitiesPage from "./pages/search/results/SearchCommunitiesPage";
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
import GalleryProvider from "./features/media/gallery/GalleryProvider";
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
import { useOptimizedIonRouter } from "./helpers/useOptimizedIonRouter";
import { TabContext } from "./TabContext";
import { usingActorRedirect } from "./ActorRedirect";
import VideoPortalProvider from "./features/media/video/VideoPortalProvider";

function buildGeneralBrowseRoutes(tab: string) {
  return [
    // eslint-disable-next-line react/jsx-key
    <Route exact path={`/${tab}/:actor/c/:community`}>
      <CommunityPage />
    </Route>,
    // eslint-disable-next-line react/jsx-key
    <Route exact path={`/${tab}/:actor/c/:community/search/posts/:search`}>
      <SearchFeedResultsPage type="Posts" />
    </Route>,
    // eslint-disable-next-line react/jsx-key
    <Route exact path={`/${tab}/:actor/c/:community/search/comments/:search`}>
      <SearchFeedResultsPage type="Comments" />
    </Route>,
    // eslint-disable-next-line react/jsx-key
    <Route exact path={`/${tab}/:actor/c/:community/sidebar`}>
      <CommunitySidebarPage />
    </Route>,
    // eslint-disable-next-line react/jsx-key
    <Route exact path={`/${tab}/:actor/c/:community/comments/:id`}>
      <PostDetail />
    </Route>,
    // eslint-disable-next-line react/jsx-key
    <Route
      exact
      path={`/${tab}/:actor/c/:community/comments/:id/thread/:threadCommentId`}
    >
      <PostDetail />
    </Route>,
    // eslint-disable-next-line react/jsx-key
    <Route exact path={`/${tab}/:actor/c/:community/comments/:id/:commentPath`}>
      <PostDetail />
    </Route>,
    // eslint-disable-next-line react/jsx-key
    <Route exact path={`/${tab}/:actor/c/:community/comments`}>
      <CommunityCommentsPage />
    </Route>,
    // eslint-disable-next-line react/jsx-key
    <Route exact path={`/${tab}/:actor/c/:community/log`}>
      <ModlogPage />
    </Route>,
    // eslint-disable-next-line react/jsx-key
    <Route exact path={`/${tab}/:actor/c/:community/modqueue`}>
      <ModqueuePage />
    </Route>,
    // eslint-disable-next-line react/jsx-key
    <Route exact path={`/${tab}/:actor/mod/comments`}>
      <CommentsPage type="ModeratorView" />
    </Route>,
    // eslint-disable-next-line react/jsx-key
    <Route exact path={`/${tab}/:actor/mod/log`}>
      <ModlogPage />
    </Route>,
    // eslint-disable-next-line react/jsx-key
    <Route exact path={`/${tab}/:actor/mod/modqueue`}>
      <ModqueuePage />
    </Route>,
    // eslint-disable-next-line react/jsx-key
    <Route exact path={`/${tab}/:actor/u/:handle`}>
      <UserPage />
    </Route>,
    // eslint-disable-next-line react/jsx-key
    <Route exact path={`/${tab}/:actor/u/:handle/posts`}>
      <ProfileFeedItemsPage type="Posts" />
    </Route>,
    // eslint-disable-next-line react/jsx-key
    <Route exact path={`/${tab}/:actor/u/:handle/comments`}>
      <ProfileFeedItemsPage type="Comments" />
    </Route>,
    // eslint-disable-next-line react/jsx-key
    <Route exact path={`/${tab}/:actor/u/:handle/saved`}>
      <ProfileFeedItemsPage type="Saved" />
    </Route>,
    // eslint-disable-next-line react/jsx-key
    <Route exact path={`/${tab}/:actor/u/:handle/hidden`}>
      <ProfileFeedHiddenPostsPage />
    </Route>,
    // eslint-disable-next-line react/jsx-key
    <Route exact path={`/${tab}/:actor/u/:handle/message`}>
      <ConversationPage />
    </Route>,
    // eslint-disable-next-line react/jsx-key
    <Route exact path={`/${tab}/:actor/u/:handle/log`}>
      <ModlogPage />
    </Route>,
    // eslint-disable-next-line react/jsx-key
    <Route exact path={`/${tab}/:actor/sidebar`}>
      <InstanceSidebarPage />
    </Route>,
  ];
}

type RouterOutletRef = IonRouterOutletCustomEvent<unknown>["target"];

export default function TabbedRoutes() {
  const ready = useAppSelector((state) => state.settings.ready);
  const selectedInstance = useAppSelector(
    instanceSelector ?? ((state) => state.auth.connectedInstance),
  );

  const pageRef = useRef<RouterOutletRef>(null);

  const pageContextValue = useMemo(() => ({ pageRef }), []);

  if (!ready) return;

  return (
    <PageContextProvider value={pageContextValue}>
      <GalleryProvider>
        <InnerTabbedRoutes
          ref={pageRef}
          // Rebuild routing on instance change
          key={selectedInstance ?? getDefaultServer()}
        />
      </GalleryProvider>
    </PageContextProvider>
  );
}

const InnerTabbedRoutes = forwardRef<RouterOutletRef>(
  function InnerTabbedRoutes(_, pageRef) {
    const defaultFeed = useAppSelector(
      (state) => state.settings.general.defaultFeed,
    );
    const selectedInstance = useAppSelector(instanceSelector);

    const router = useOptimizedIonRouter();
    const { tabRef } = useContext(TabContext);

    // Reset route on initialize, if needed
    // (reset when it doesn't make sense breaks ionic react router)
    useEffect(() => {
      if (!router.canGoBack()) return;

      const pathname = router.getRouteInfo()?.pathname;

      if (!pathname) return;

      const pathnameSections = pathname.split("/").length - 1;

      if (pathname.startsWith("/posts")) {
        // special case for posts tab: /posts/lemmy.world is initial tab route
        if (pathnameSections <= 2) return;
      }

      // all other tabs are /inbox, /settings etc as base route
      if (pathnameSections <= 1) return;

      function push() {
        router.push(`/${tabRef?.current || "posts"}`, "none", "push");
      }

      // have to wait for the ActorRedirect to do its thing, so it doesn't get clobbered
      if (usingActorRedirect) {
        queueMicrotask(push);
        return;
      }

      push();
    }, [router, tabRef]);

    const redirectRoute = (() => {
      if (isInstalled()) return ""; // redirect to be handled by <CommunitiesListRedirectBootstrapper />

      if (!defaultFeed) return "";

      return getPathForFeed(defaultFeed);
    })();

    return (
      <VideoPortalProvider>
        <IonTabs>
          <IonRouterOutlet ref={pageRef}>
            <Route exact path="/">
              {defaultFeed ? (
                <Redirect
                  to={`/posts/${
                    selectedInstance ?? getDefaultServer()
                  }${redirectRoute}`}
                  push={false}
                />
              ) : (
                ""
              )}
            </Route>
            <Route exact path="/posts">
              {defaultFeed ? (
                <Redirect
                  to={`/posts/${
                    selectedInstance ?? getDefaultServer()
                  }${redirectRoute}`}
                  push={false}
                />
              ) : (
                ""
              )}
            </Route>
            <Route exact path="/posts/:actor/home">
              <SpecialFeedPage type="Subscribed" />
            </Route>
            <Route exact path="/posts/:actor/all">
              <SpecialFeedPage type="All" />
            </Route>
            <Route exact path="/posts/:actor/local">
              <SpecialFeedPage type="Local" />
            </Route>
            <Route exact path="/posts/:actor/mod">
              <SpecialFeedPage type="ModeratorView" />
            </Route>
            <Route exact path="/posts/:actor">
              <CommunitiesPage />
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
      </VideoPortalProvider>
    );
  },
);

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
