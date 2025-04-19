import { IonRouterOutlet } from "@ionic/react";
import { Redirect, Route } from "react-router-dom";

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

      <PostPageContent id={"16213348"} community={"memes@lemmy.world"} />
    </div>
  );
}

Outlet.isRouterOutlet = true;
