import { IonRouterOutlet } from "@ionic/react";
import { useViewportSize } from "@mantine/hooks";
import { noop } from "es-toolkit";
import React, { createContext, useEffect, useRef, useState } from "react";
import { Redirect, Route, useLocation } from "react-router-dom";

import { instanceSelector } from "#/features/auth/authSelectors";
import { isInstalled } from "#/helpers/device";
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

import styles from "./TabbedRoutes.module.css";

export default function Outlet() {
  const defaultFeed = useAppSelector(
    (state) => state.settings.general.defaultFeed,
  );
  const selectedInstance = useAppSelector(instanceSelector);

  const redirectRoute = (() => {
    if (isInstalled()) return ""; // redirect to be handled by <CommunitiesListRedirectBootstrapper />

    if (!defaultFeed) return "";

    return getPathForFeed(defaultFeed);
  })();

  return (
    <OutletProvider>
      <div className={styles.routerOutletContents}>
        <IonRouterOutlet className={styles.routerOutletLeftPane}>
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

        <SecondColumnContent />
      </div>
    </OutletProvider>
  );
}

Outlet.isRouterOutlet = true;

function OutletProvider({ children }: { children: React.ReactNode }) {
  const [postDetailDictionary, setPostDetailDictionary] = useState<
    Record<string, React.ComponentProps<typeof PostPageContent> | undefined>
  >({});
  const tab = useLocation().pathname.split("/")[1];

  const tabRef = useRef(tab);

  useEffect(() => {
    tabRef.current = tab;
  }, [tab]);

  function setPostDetail(
    postDetail: React.ComponentProps<typeof PostPageContent> | undefined,
  ) {
    if (!tabRef.current) throw new Error("No tab");

    setPostDetailDictionary({
      ...postDetailDictionary,
      [tabRef.current]: postDetail,
    });
  }

  const twoColumnLayoutEnabled = useViewportSize().width > 768;

  return (
    <OutletContext
      value={{
        postDetail: tab ? postDetailDictionary[tab] : undefined,
        setPostDetail,
        twoColumnLayoutEnabled,
        _postDetailDictionary: postDetailDictionary,
      }}
    >
      {children}
    </OutletContext>
  );
}

export const OutletContext = createContext<{
  postDetail: React.ComponentProps<typeof PostPageContent> | undefined;
  setPostDetail: (
    postDetail: React.ComponentProps<typeof PostPageContent> | undefined,
  ) => void;
  twoColumnLayoutEnabled: boolean;
  _postDetailDictionary: Record<
    string,
    React.ComponentProps<typeof PostPageContent> | undefined
  >;
}>({
  postDetail: undefined,
  setPostDetail: noop,
  twoColumnLayoutEnabled: false,
  _postDetailDictionary: {},
});
