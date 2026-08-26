import route from "#/routes/common/Route";
import CommunitiesExplorePage from "#/routes/pages/search/CommunitiesExplorePage";
import RandomCommunityPage from "#/routes/pages/search/RandomCommunityPage";
import SearchCommunitiesPage from "#/routes/pages/search/results/SearchCommunitiesPage";
import SearchPostsResultsPage from "#/routes/pages/search/results/SearchFeedResultsPage";
import SearchPage from "#/routes/pages/search/SearchPage";

export default [
  route("/search", <SearchPage />),
  route("/search/random", <RandomCommunityPage />),
  route("/search/posts/:search", <SearchPostsResultsPage type="posts" />),
  route("/search/comments/:search", <SearchPostsResultsPage type="comments" />),
  route("/search/communities/:search", <SearchCommunitiesPage />),
  route("/search/explore", <CommunitiesExplorePage />),
];
