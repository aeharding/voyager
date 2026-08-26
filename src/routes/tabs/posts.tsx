import { Navigate } from "react-router";

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
    route(
      "/posts",
      defaultFeed ? (
        <Navigate
          to={`/posts/${selectedInstance ?? getDefaultServer()}${redirectRoute}`}
          replace
        />
      ) : (
        ""
      ),
    ),
    route("/posts/:actor", <CommunitiesPage />),
  ];
}
