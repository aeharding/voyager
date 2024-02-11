/* eslint-disable react/jsx-key */

import { Redirect } from "react-router";
import Route from "../Route";
import { buildGeneralBrowseRoutes } from "./general";
import ProfilePage from "../pages/profile/ProfilePage";

export default [
  <Route exact path="/profile">
    <ProfilePage />
  </Route>,
  ...buildGeneralBrowseRoutes("profile"),
  <Route exact path="/profile/:actor">
    <Redirect to="/profile" push={false} />
  </Route>,
];
