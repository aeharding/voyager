import { Navigate } from "react-router";

import Route from "#/routes/common/Route";
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
    <Route
      path="/posts"
      element={
        defaultFeed ? (
          <Navigate
            to={`/posts/${selectedInstance ?? getDefaultServer()}${redirectRoute}`}
            replace
          />
        ) : (
          ""
        )
      }
    />,
    <Route path="/posts/:actor" element={<CommunitiesPage />} />,
  ];
}
