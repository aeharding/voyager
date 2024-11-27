/* eslint-disable react/jsx-key */
import Route from "#/routes/common/Route";
import CommunitiesResultsPage from "#/routes/pages/search/CommunitiesResultsPage";
import RandomCommunityPage from "#/routes/pages/search/RandomCommunityPage";
import SearchCommunitiesPage from "#/routes/pages/search/results/SearchCommunitiesPage";
import SearchPostsResultsPage from "#/routes/pages/search/results/SearchFeedResultsPage";
import SearchPage from "#/routes/pages/search/SearchPage";

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
  <Route exact path="/search/explore">
    <CommunitiesResultsPage />
  </Route>,
];
