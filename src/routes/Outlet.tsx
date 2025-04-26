import { IonRouterOutlet } from "@ionic/react";
import { noop } from "es-toolkit";
import React, { createContext, use, useEffect, useState } from "react";
import { Redirect, Route } from "react-router-dom";

import { instanceSelector } from "#/features/auth/authSelectors";
import { isInstalled } from "#/helpers/device";
import { useOptimizedIonRouter } from "#/helpers/useOptimizedIonRouter";
import { getDefaultServer } from "#/services/app";
import { useAppSelector } from "#/store";

import { PostPageContent } from "./pages/posts/PostPage";
import { getPathForFeed } from "./TabbedRoutes";
import general from "./tabs/general";
import inbox from "./tabs/inbox";
import buildPostsRoutes from "./tabs/posts";
import profile from "./tabs/profile";
import search from "./tabs/search";
import settings from "./tabs/settings";
import SecondColumnContent from "./twoColumn/SecondColumnContent";
import useIsTwoColumnLayout from "./twoColumn/useIsTwoColumnLayout";

import styles from "./Outlet.module.css";

/**
 * Ionic will always rerender this component.
 * So make it a dummy component for react-compiler to optimize
 */
export default function Outlet() {
  return <AppOutlet />;
}

Outlet.isRouterOutlet = true;

function AppOutlet() {
  return (
    <OutletProvider>
      <AppRoutes />
    </OutletProvider>
  );
}

function AppRoutes() {
  const defaultFeed = useAppSelector(
    (state) => state.settings.general.defaultFeed,
  );
  const selectedInstance = useAppSelector(instanceSelector);

  const redirectRoute = (() => {
    if (isInstalled()) return ""; // redirect to be handled by <CommunitiesListRedirectBootstrapper />

    if (!defaultFeed) return "";

    return getPathForFeed(defaultFeed);
  })();

  const { isTwoColumnLayout: twoColumnLayoutEnabled } = use(OutletContext);

  return (
    <div className={styles.routerOutletContents}>
      <IonRouterOutlet>
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

      {twoColumnLayoutEnabled && <SecondColumnContent />}
    </div>
  );
}

type PostDetailDictionary =
  | Record<string, React.ComponentProps<typeof PostPageContent> | undefined>
  | undefined;

function OutletProvider({ children }: { children: React.ReactNode }) {
  const router = useOptimizedIonRouter();

  const [postDetailDictionary, setPostDetailDictionary] =
    useState<PostDetailDictionary>(undefined);

  function setPostDetail(
    postDetail: React.ComponentProps<typeof PostPageContent> | undefined,
  ) {
    const tab = router.getRouteInfo()?.pathname.split("/")[1];

    if (!tab) throw new Error("No tab");

    setPostDetailDictionary({
      ...postDetailDictionary,
      [tab]: postDetail,
    });
  }

  const isTwoColumnLayout = useIsTwoColumnLayout();

  useEffect(() => {
    if (isTwoColumnLayout) return;

    setPostDetailDictionary(undefined);
  }, [isTwoColumnLayout]);

  return (
    <OutletContext
      value={{
        setPostDetail,
        isTwoColumnLayout,
        postDetailDictionary,
      }}
    >
      {children}
    </OutletContext>
  );
}

export const OutletContext = createContext<{
  setPostDetail: (
    postDetail: React.ComponentProps<typeof PostPageContent> | undefined,
  ) => void;
  isTwoColumnLayout: boolean;
  postDetailDictionary: PostDetailDictionary;
}>({
  setPostDetail: noop,
  isTwoColumnLayout: false,
  postDetailDictionary: undefined,
});
