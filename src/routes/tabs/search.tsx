/* eslint-disable react/jsx-key */

import Route from "../common/Route";
import SearchPage from "../pages/search/SearchPage";
import SearchPostsResultsPage from "../pages/search/results/SearchFeedResultsPage";
import SearchCommunitiesPage from "../pages/search/results/SearchCommunitiesPage";
import RandomCommunityPage from "../pages/search/RandomCommunityPage";

export default [
  <Route exact path="/search">
    <SearchPage />
  </Route>,
  <Route exact path="/search/random">
    <RandomCommunityPage />
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
];
