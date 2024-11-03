/* eslint-disable react/jsx-key */
import { Redirect } from "react-router";

import Route from "#/routes/common/Route";
import CommunitiesPage from "#/routes/pages/posts/CommunitiesPage";
import { getDefaultServer } from "#/services/app";
import { DefaultFeedType } from "#/services/db";

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
    <Route exact path="/posts">
      {defaultFeed ? (
        <Redirect
          to={`/posts/${selectedInstance ?? getDefaultServer()}${redirectRoute}`}
          push={false}
        />
      ) : (
        ""
      )}
    </Route>,
    <Route exact path="/posts/:actor">
      <CommunitiesPage />
    </Route>,
  ];
}
