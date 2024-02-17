/* eslint-disable react/jsx-key */

import { Redirect } from "react-router";
import Route from "../common/Route";
import { buildGeneralBrowseRoutes } from "./general";
import { getDefaultServer } from "../../services/app";
import SpecialFeedPage from "../pages/shared/SpecialFeedPage";
import CommunitiesPage from "../pages/posts/CommunitiesPage";
import { DefaultFeedType } from "../../services/db";

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
    <Route exact path="/posts/:actor/home">
      <SpecialFeedPage type="Subscribed" />
    </Route>,
    <Route exact path="/posts/:actor/all">
      <SpecialFeedPage type="All" />
    </Route>,
    <Route exact path="/posts/:actor/local">
      <SpecialFeedPage type="Local" />
    </Route>,
    <Route exact path="/posts/:actor/mod">
      <SpecialFeedPage type="ModeratorView" />
    </Route>,
    <Route exact path="/posts/:actor">
      <CommunitiesPage />
    </Route>,
    ...buildGeneralBrowseRoutes("posts"),
  ];
}
