import { IonRouterOutlet } from "@ionic/react";
import { use } from "react";
import { Redirect, Route } from "react-router-dom";

import { instanceSelector } from "#/features/auth/authSelectors";
import { isInstalled } from "#/helpers/device";
import { getDefaultServer } from "#/services/app";
import { useAppSelector } from "#/store";

import { OutletContext } from "./OutletProvider";
import { getPathForFeed } from "./TabbedRoutes";
import general from "./tabs/general";
import inbox from "./tabs/inbox";
import buildPostsRoutes from "./tabs/posts";
import profile from "./tabs/profile";
import search from "./tabs/search";
import settings from "./tabs/settings";
import ColumnDivider from "./twoColumn/ColumnDivider";
import SecondColumnContent from "./twoColumn/SecondColumnContent";

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
  return <AppRoutes />;
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
      {twoColumnLayoutEnabled && <ColumnDivider />}
      {twoColumnLayoutEnabled && <SecondColumnContent />}

      {/* This is first (order = -1) in css. Why? See Outlet.module.css */}
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
    </div>
  );
}
