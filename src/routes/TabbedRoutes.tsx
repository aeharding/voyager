import { Redirect } from "react-router-dom";
import Route from "./common/Route";
import { IonRouterOutlet, IonTabs } from "@ionic/react";
import { useAppSelector } from "../store";
import { instanceSelector } from "../features/auth/authSelectors";
import { forwardRef, useContext, useEffect, useMemo, useRef } from "react";
import { IonRouterOutletCustomEvent } from "@ionic/core";
import { PageContextProvider } from "../features/auth/PageContext";
import { getDefaultServer } from "../services/app";
import GalleryProvider from "../features/media/gallery/GalleryProvider";
import { DefaultFeedType, ODefaultFeedType } from "../services/db";
import TabBar from "./TabBar";
import { isInstalled } from "../helpers/device";
import { useOptimizedIonRouter } from "../helpers/useOptimizedIonRouter";
import { TabContext } from "../core/TabContext";
import { usingActorRedirect } from "./common/ActorRedirect";
import VideoPortalProvider from "../features/media/video/VideoPortalProvider";
import settings from "./tabs/settings";
import buildPostsRoutes from "./tabs/posts";
import inbox from "./tabs/inbox";
import profile from "./tabs/profile";
import search from "./tabs/search";
import general from "./tabs/general";

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

            {...buildPostsRoutes({
              defaultFeed,
              redirectRoute,
              selectedInstance,
            })}

            {...inbox}

            {...profile}

            {...search}

            {...settings}

            {...general}
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
