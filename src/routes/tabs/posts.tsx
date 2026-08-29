import { Navigate, Route } from "react-router";

import { isInstalled } from "#/helpers/device";
import route from "#/routes/common/Route";
import CommunitiesPage from "#/routes/pages/posts/CommunitiesPage";
import { getDefaultServer } from "#/services/app";
import { DefaultFeedType } from "#/services/db/types";

interface Props {
  defaultFeed: DefaultFeedType | undefined;
  selectedInstance: string | undefined;
  redirectRoute: string;
}

export default function buildPostsRoutes({
  defaultFeed,
  redirectRoute,
  selectedInstance,
}: Props) {
  return [
    // Ionic v9 applies redirect view handling only to a direct Navigate element.
    // Hiding it inside route() can leave the previous tab visible.
    <Route
      key="/posts"
      path="/posts"
      element={
        isInstalled() || defaultFeed ? (
          <Navigate
            to={`/posts/${selectedInstance ?? getDefaultServer()}${redirectRoute}`}
            replace
          />
        ) : (
          ""
        )
      }
    />,
    route("/posts/:actor", <CommunitiesPage />),
  ];
}
