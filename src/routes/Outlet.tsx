import {
  IonBackButton,
  IonButton,
  IonIcon,
  IonRouterOutlet,
} from "@ionic/react";
import { noop } from "es-toolkit";
import { close } from "ionicons/icons";
import { PostView } from "lemmy-js-client";
import React, { createContext, use, useState } from "react";
import { Redirect, Route, useLocation } from "react-router-dom";

import { instanceSelector } from "#/features/auth/authSelectors";
import { cx } from "#/helpers/css";
import { isInstalled } from "#/helpers/device";
import { getHandle } from "#/helpers/lemmy";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
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
import TwoColumnEmpty from "./twoColumn/TwoColumnEmpty";

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

        <SecondColumnPostPageContent />
      </div>
    </OutletProvider>
  );
}

Outlet.isRouterOutlet = true;

const OutletContext = createContext<{
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

function OutletProvider({ children }: { children: React.ReactNode }) {
  const [postDetailDictionary, setPostDetailDictionary] = useState<
    Record<string, React.ComponentProps<typeof PostPageContent> | undefined>
  >({});
  const tab = useLocation().pathname.split("/")[1];

  function setPostDetail(
    postDetail: React.ComponentProps<typeof PostPageContent> | undefined,
  ) {
    if (!tab) throw new Error("No tab");

    setPostDetailDictionary({
      ...postDetailDictionary,
      [tab]: postDetail,
    });
  }

  return (
    <OutletContext
      value={{
        postDetail: tab ? postDetailDictionary[tab] : undefined,
        setPostDetail,
        twoColumnLayoutEnabled: true,
        _postDetailDictionary: postDetailDictionary,
      }}
    >
      {children}
    </OutletContext>
  );
}

export function useOpenPostProps(postView: PostView) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const { setPostDetail, twoColumnLayoutEnabled } = use(OutletContext);
  const router = useOptimizedIonRouter();

  return {
    routerLink: buildGeneralBrowseLink(
      `/c/${getHandle(postView.community)}/comments/${postView.post.id}`,
    ),
    onClick: (e: React.MouseEvent<unknown>) => {
      if (!twoColumnLayoutEnabled) return;

      e.preventDefault();

      const existingPath = router.getRouteInfo()?.pathname;

      if (!existingPath) throw new Error("No existing path");

      setPostDetail({
        id: `${postView.post.id}`,
        community: getHandle(postView.community),
      });
    },
  };
}

function SecondColumnPostPageContent() {
  const { postDetail, _postDetailDictionary } = use(OutletContext);

  return (
    <IsSecondColumnContext value={true}>
      {Object.entries(_postDetailDictionary).map(
        ([tab, currPostDetail]) =>
          currPostDetail && (
            <PostPageContent
              {...currPostDetail}
              key={`${tab}${currPostDetail.id}`}
              className={cx(currPostDetail !== postDetail && "ion-hide")}
            />
          ),
      )}
      {!postDetail && <TwoColumnEmpty />}
    </IsSecondColumnContext>
  );
}

const IsSecondColumnContext = createContext<boolean>(false);

function useIsSecondColumn() {
  return use(IsSecondColumnContext);
}

export function AppBackButton(
  props: Omit<React.ComponentProps<typeof IonBackButton>, "ref">,
) {
  const isSecondColumn = useIsSecondColumn();
  const { setPostDetail } = use(OutletContext);

  if (isSecondColumn)
    return (
      <IonButton onClick={() => setPostDetail(undefined)}>
        <IonIcon icon={close} /> Close
      </IonButton>
    );

  return <IonBackButton {...props} />;
}
