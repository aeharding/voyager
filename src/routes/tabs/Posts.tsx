import { IonPage, IonRouterOutlet } from "@ionic/react";
import { Navigate, Route } from "react-router";

import { instanceSelector } from "#/features/auth/authSelectors";
import { isInstalled } from "#/helpers/device";
import { TabNameContext } from "#/routes/common/Route";
import CommunitiesPage from "#/routes/pages/posts/CommunitiesPage";
import { getDefaultServer } from "#/services/app";
import { useAppSelector } from "#/store";

import { getPathForFeed } from "../getPathForFeed";
import { instanceBrowseRouteElements } from "./shared/instanceBrowseRoutes";

export default function Posts() {
  const defaultFeed = useAppSelector(
    (state) => state.settings.general.defaultFeed,
  );
  const selectedInstance = useAppSelector(instanceSelector);

  const redirectRoute = (() => {
    if (isInstalled()) return ""; // redirect to be handled by <CommunitiesListRedirectBootstrapper />

    if (!defaultFeed) return "";

    return getPathForFeed(defaultFeed);
  })();

  if (!redirectRoute) return;

  return (
    <IonPage>
      <TabNameContext value="posts">
        <IonRouterOutlet>
          <Route
            index
            element={
              <Navigate
                to={`/posts/${selectedInstance ?? getDefaultServer()}${redirectRoute}`}
                replace
              />
            }
          />
          <Route path=":actor" element={<CommunitiesPage />} />
          {...instanceBrowseRouteElements({ postsActorIndex: false })}
        </IonRouterOutlet>
      </TabNameContext>
    </IonPage>
  );
}
