/* eslint-disable react/jsx-key */

import { Redirect } from "react-router";
import Route from "../common/Route";
import ProfilePage from "../pages/profile/ProfilePage";

export default [
  <Route exact path="/profile">
    <ProfilePage />
  </Route>,
  <Route exact path="/profile/:actor">
    <Redirect to="/profile" push={false} />
  </Route>,
];
