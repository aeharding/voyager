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
import { Redirect, Route } from "react-router-dom";

import { instanceSelector } from "#/features/auth/authSelectors";
import { isInstalled } from "#/helpers/device";
import { getHandle } from "#/helpers/lemmy";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
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
}>({
  postDetail: undefined,
  setPostDetail: noop,
  twoColumnLayoutEnabled: false,
});

function OutletProvider({ children }: { children: React.ReactNode }) {
  const [postDetail, setPostDetail] = useState<
    React.ComponentProps<typeof PostPageContent> | undefined
  >(undefined);

  return (
    <OutletContext
      value={{ postDetail, setPostDetail, twoColumnLayoutEnabled: true }}
    >
      {children}
    </OutletContext>
  );
}

export function useOpenPostProps(postView: PostView) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const { setPostDetail, twoColumnLayoutEnabled } = use(OutletContext);

  return {
    routerLink: buildGeneralBrowseLink(
      `/c/${getHandle(postView.community)}/comments/${postView.post.id}`,
    ),
    onClick: (e: React.MouseEvent<unknown>) => {
      if (!twoColumnLayoutEnabled) return;

      e.preventDefault();

      setPostDetail({
        id: `${postView.post.id}`,
        community: getHandle(postView.community),
      });
    },
  };
}

function SecondColumnPostPageContent() {
  const { postDetail } = use(OutletContext);

  if (!postDetail) return null;

  return (
    <IsSecondColumnContext value={true}>
      <PostPageContent {...postDetail} key={postDetail.id} />
    </IsSecondColumnContext>
  );
}

const IsSecondColumnContext = createContext<boolean>(false);

function useIsSecondColumn() {
  return use(IsSecondColumnContext);
}

export function AppBackButton(
  props: React.ComponentProps<typeof IonBackButton>,
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
