import { SplashScreen } from "@capacitor/splash-screen";
import { IonTabs } from "@ionic/react";
import { use, useEffect } from "react";

import { TabContext } from "#/core/TabContext";
import { instanceSelector } from "#/features/auth/authSelectors";
import { SharedDialogContextProvider } from "#/features/auth/SharedDialogContext";
import GalleryProvider from "#/features/media/gallery/GalleryProvider";
import VideoPortalProvider from "#/features/media/video/VideoPortalProvider";
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

  useEffect(() => {
    if (!ready) return;

    SplashScreen.hide();
  }, [ready]);

  if (!ready) return;

  return (
    <SharedDialogContextProvider>
      {children}
      <VideoPortalProvider>
        <GalleryProvider>
          <InnerTabbedRoutes
            // Rebuild routing on instance change
            key={selectedInstance ?? getDefaultServer()}
          />
        </GalleryProvider>
      </VideoPortalProvider>
    </SharedDialogContextProvider>
  );
}

function InnerTabbedRoutes() {
  const router = useOptimizedIonRouter();
  const { tabRef } = use(TabContext);

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
  }, [router, tabRef]);

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
