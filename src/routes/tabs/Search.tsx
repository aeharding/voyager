import { IonRouterOutlet } from "@ionic/react";
import { Route } from "react-router";

import { TabNameContext } from "#/routes/common/Route";
import CommunitiesExplorePage from "#/routes/pages/search/CommunitiesExplorePage";
import RandomCommunityPage from "#/routes/pages/search/RandomCommunityPage";
import SearchCommunitiesPage from "#/routes/pages/search/results/SearchCommunitiesPage";
import SearchPostsResultsPage from "#/routes/pages/search/results/SearchFeedResultsPage";
import SearchPage from "#/routes/pages/search/SearchPage";

import { instanceBrowseRouteElements } from "./shared/instanceBrowseRoutes";

export default function Search() {
  return (
    <TabNameContext value="search">
      <IonRouterOutlet>
        <Route index element={<SearchPage />} />
        {...instanceBrowseRouteElements({ postsActorIndex: false })}
        <Route path="random" element={<RandomCommunityPage />} />
        <Route
          path="posts/:search"
          element={<SearchPostsResultsPage type="Posts" />}
        />
        <Route
          path="comments/:search"
          element={<SearchPostsResultsPage type="Comments" />}
        />
        <Route path="communities/:search" element={<SearchCommunitiesPage />} />
        <Route path="explore" element={<CommunitiesExplorePage />} />
      </IonRouterOutlet>
    </TabNameContext>
  );
}
