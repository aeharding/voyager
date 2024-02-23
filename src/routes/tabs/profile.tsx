/* eslint-disable react/jsx-key */

import { Redirect } from "react-router";
import Route from "../common/Route";
import ProfilePage from "../pages/profile/ProfilePage";
import ProfileFeedItemsPage from "../pages/profile/ProfileFeedItemsPage";

export default [
  <Route exact path="/profile">
    <ProfilePage />
  </Route>,
  <Route exact path="/profile/:actor">
    <Redirect to="/profile" push={false} />
  </Route>,
  <Route exact path="/profile/:actor/u/:handle/upvoted">
    <ProfileFeedItemsPage type="Upvoted" />
  </Route>,
  <Route exact path="/profile/:actor/u/:handle/downvoted">
    <ProfileFeedItemsPage type="Downvoted" />
  </Route>,
];
