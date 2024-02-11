/* eslint-disable react/jsx-key */

import { Redirect } from "react-router";
import Route from "../Route";
import SearchPage from "../pages/search/SearchPage";
import SearchPostsResultsPage from "../pages/search/results/SearchFeedResultsPage";
import SearchCommunitiesPage from "../pages/search/results/SearchCommunitiesPage";
import { buildGeneralBrowseRoutes } from "./general";

export default [
  <Route exact path="/search">
    <SearchPage />
  </Route>,
  <Route exact path="/search/posts/:search">
    <SearchPostsResultsPage type="Posts" />
  </Route>,
  <Route exact path="/search/comments/:search">
    <SearchPostsResultsPage type="Comments" />
  </Route>,
  <Route exact path="/search/communities/:search">
    <SearchCommunitiesPage />
  </Route>,
  ...buildGeneralBrowseRoutes("search"),
  <Route exact path="/search/:actor">
    <Redirect to="/search" push={false} />
  </Route>,
];
