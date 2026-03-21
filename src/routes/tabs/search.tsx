import Route from "#/routes/common/Route";
import CommunitiesExplorePage from "#/routes/pages/search/CommunitiesExplorePage";
import RandomCommunityPage from "#/routes/pages/search/RandomCommunityPage";
import SearchCommunitiesPage from "#/routes/pages/search/results/SearchCommunitiesPage";
import SearchPostsResultsPage from "#/routes/pages/search/results/SearchFeedResultsPage";
import SearchPage from "#/routes/pages/search/SearchPage";

export default [
  <Route path="/search" element={<SearchPage />} />,
  <Route path="/search/random" element={<RandomCommunityPage />} />,
  <Route
    path="/search/posts/:search"
    element={<SearchPostsResultsPage type="Posts" />}
  />,
  <Route
    path="/search/comments/:search"
    element={<SearchPostsResultsPage type="Comments" />}
  />,
  <Route
    path="/search/communities/:search"
    element={<SearchCommunitiesPage />}
  />,
  <Route path="/search/explore" element={<CommunitiesExplorePage />} />,
];
