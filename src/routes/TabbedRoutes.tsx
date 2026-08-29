import { SplashScreen } from "@capacitor/splash-screen";
import { IonTabs, useIonRouter } from "@ionic/react";
import { use, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation } from "react-router";

import { TabContext } from "#/core/TabContext";
import { showAppWindow } from "#/core/tauri/WindowChrome";
import { instanceSelector, urlSelector } from "#/features/auth/authSelectors";
import GalleryProvider from "#/features/media/gallery/GalleryProvider";
import VideoPortalProvider from "#/features/media/video/VideoPortalProvider";
import { isInstalled } from "#/helpers/device";
import { useOptimizedIonRouter } from "#/helpers/useOptimizedIonRouter";
import { getDefaultServer } from "#/services/app";
import { DefaultFeedType, ODefaultFeedType } from "#/services/db/types";
import { useAppSelector } from "#/store";

import { usingActorRedirect } from "./common/ActorRedirect";
import Outlet from "./Outlet";
import TabBar from "./TabBar";

export default function TabbedRoutes({ children }: React.PropsWithChildren) {
  const ready = useAppSelector((state) => state.settings.ready);
  const selectedInstance = useAppSelector(
    instanceSelector ?? ((state) => state.auth.connectedInstance),
  );
  const routingInstance = useAppSelector(urlSelector) ?? getDefaultServer();
  const defaultFeed = useAppSelector(
    (state) => state.settings.general.defaultFeed,
  );
  const location = useLocation();
  const [routedInstance, setRoutedInstance] = useState(routingInstance);
  const switchingPostsInstance =
    routedInstance !== routingInstance &&
    isPostsRouteForActor(location.pathname, routedInstance);

  if (routedInstance !== routingInstance && !switchingPostsInstance)
    setRoutedInstance(routingInstance);

  let resetPath: string | undefined;

  if (switchingPostsInstance) {
    if (isInstalled()) resetPath = `/posts/${routingInstance}`;
    else if (defaultFeed)
      resetPath = `/posts/${routingInstance}${getPathForFeed(defaultFeed)}`;
  }

  useEffect(() => {
    if (!ready) return;

    SplashScreen.hide();
    showAppWindow();
  }, [ready]);

  if (!ready) return;

  let routes: React.ReactNode;

  if (switchingPostsInstance) {
    if (resetPath) routes = <InstanceRouteReset path={resetPath} />;
  } else {
    routes = (
      <InnerTabbedRoutes
        // Rebuild routing on instance change
        key={selectedInstance ?? getDefaultServer()}
      />
    );
  }

  return (
    <>
      {children}
      <VideoPortalProvider>
        <GalleryProvider>{routes}</GalleryProvider>
      </VideoPortalProvider>
    </>
  );
}

function InstanceRouteReset({ path }: { path: string }) {
  const { navigateRoot } = useIonRouter();
  const requestedRef = useRef(false);

  useLayoutEffect(() => {
    if (requestedRef.current) return;

    requestedRef.current = true;
    navigateRoot(path);
  }, [navigateRoot, path]);

  return null;
}

function isPostsRouteForActor(pathname: string, actor: string) {
  const [, tab, routeActor] = pathname.split("/");

  return tab === "posts" && routeActor === actor;
}

function InnerTabbedRoutes() {
  const router = useOptimizedIonRouter();
  const { canGoBack, routeInfo } = useIonRouter();
  const location = useLocation();
  const { tabRef } = use(TabContext);
  const initializationHandledRef = useRef(false);

  // Reset route on initialize, if needed
  // (reset when it doesn't make sense breaks ionic react router)
  useEffect(() => {
    if (initializationHandledRef.current) return;

    // React Router updates before Ionic routeInfo. Acting on the stale route
    // after navigateRoot would push /posts and recreate the old back stack.
    if (!routeInfo || routeInfo.pathname !== location.pathname) return;

    initializationHandledRef.current = true;
    if (!canGoBack()) return;

    const pathname = routeInfo.pathname;

    const pathnameSections = pathname.split("/").length - 1;

    if (pathname.startsWith("/posts")) {
      // special case for posts tab: /posts/lemmy.world is initial tab route
      if (pathnameSections <= 2) return;
    }

    // all other tabs are /inbox, /settings etc as base route
    if (pathnameSections <= 1) return;

    function push() {
      // TODO requestAnimationFrame workaround added for regression caused in react 19 upgrades,
      // broke right after eda26916b56ca0593f4711516a3ef3048f75fbb6. needs investigation
      // repro: be completely logged out. restart app. login. go to a post, go back,
      // repeat navigations, see issue
      requestAnimationFrame(() => {
        router.push(`/${tabRef?.current || "posts"}`, "none", "push");
      });
    }

    // have to wait for the ActorRedirect to do its thing, so it doesn't get clobbered
    if (usingActorRedirect) {
      queueMicrotask(push);
      return;
    }

    push();
  }, [canGoBack, location.pathname, routeInfo, router, tabRef]);

  return (
    <IonTabs>
      <Outlet />

      <TabBar slot="bottom" />
    </IonTabs>
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
