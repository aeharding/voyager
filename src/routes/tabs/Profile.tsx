import { IonRouterOutlet } from "@ionic/react";
import { Route } from "react-router";

import { TabNameContext } from "#/routes/common/Route";
import ProfilePage from "#/routes/pages/profile/ProfilePage";

import { instanceBrowseRouteElements } from "./shared/instanceBrowseRoutes";

export default function Profile() {
  return (
    <TabNameContext value="profile">
      <IonRouterOutlet>
        <Route index element={<ProfilePage />} />
        {...instanceBrowseRouteElements({ postsActorIndex: false })}
      </IonRouterOutlet>
    </TabNameContext>
  );
}
