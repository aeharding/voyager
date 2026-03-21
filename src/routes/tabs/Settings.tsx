import { IonRouterOutlet } from "@ionic/react";
import { Route } from "react-router-dom";

import { TabNameContext } from "#/routes/common/Route";
import SearchCommunitiesPage from "#/routes/pages/search/results/SearchCommunitiesPage";
import AboutPage from "#/routes/pages/settings/about/AboutPage";
import AboutThanksPage from "#/routes/pages/settings/about/AboutThanksPage";
import AppearancePage from "#/routes/pages/settings/AppearancePage";
import AppearanceThemePage from "#/routes/pages/settings/AppearanceThemePage";
import AppIconPage from "#/routes/pages/settings/AppIconPage";
import BiometricPage from "#/routes/pages/settings/BiometricPage";
import BlocksSettingsPage from "#/routes/pages/settings/BlocksSettingsPage";
import BrowseTagsPage from "#/routes/pages/settings/BrowseTagsPage";
import DeviceModeSettingsPage from "#/routes/pages/settings/DeviceModeSettingsPage";
import GeneralPage from "#/routes/pages/settings/GeneralPage";
import GesturesPage from "#/routes/pages/settings/GesturesPage";
import HidingSettingsPage from "#/routes/pages/settings/HidingSettingsPage";
import InstallAppPage from "#/routes/pages/settings/InstallAppPage";
import RedditMigratePage from "#/routes/pages/settings/RedditDataMigratePage";
import RedditMigrateSubsListPage from "#/routes/pages/settings/RedditMigrateSubsListPage";
import SettingsPage from "#/routes/pages/settings/SettingsPage";
import TagsSettingsPage from "#/routes/pages/settings/TagsSettingsPage";
import UpdateAppPage from "#/routes/pages/settings/UpdateAppPage";

import { instanceBrowseRouteElements } from "./shared/instanceBrowseRoutes";

/**
 * Settings tab: parent route is `path="/settings/*"` on the root `IonRouterOutlet`;
 * child paths are relative (Ionic nested outlet pattern).
 * No outer `AppPage` — each screen wraps itself; `IonTabs` supplies the tab shell.
 */
export default function Settings() {
  return (
    <TabNameContext value="settings">
      <IonRouterOutlet>
        <Route index element={<SettingsPage />} />
        {...instanceBrowseRouteElements({ postsActorIndex: false })}
        <Route path="install" element={<InstallAppPage />} />
        <Route path="update" element={<UpdateAppPage />} />
        <Route path="general" element={<GeneralPage />} />
        <Route path="general/hiding" element={<HidingSettingsPage />} />
        <Route path="appearance" element={<AppearancePage />} />
        <Route path="appearance/theme" element={<AppearanceThemePage />} />
        <Route
          path="appearance/theme/mode"
          element={<DeviceModeSettingsPage />}
        />
        <Route path="app-icon" element={<AppIconPage />} />
        <Route path="biometric" element={<BiometricPage />} />
        <Route path="gestures" element={<GesturesPage />} />
        <Route path="blocks" element={<BlocksSettingsPage />} />
        <Route path="tags" element={<TagsSettingsPage />} />
        <Route path="tags/browse" element={<BrowseTagsPage />} />
        <Route path="reddit-migrate" element={<RedditMigratePage />} />
        <Route
          path="reddit-migrate/:link"
          element={<RedditMigrateSubsListPage />}
        />
        <Route
          path="reddit-migrate/:link/:search"
          element={<SearchCommunitiesPage />}
        />
        <Route path="about" element={<AboutPage />} />
        <Route path="about/thanks" element={<AboutThanksPage />} />
      </IonRouterOutlet>
    </TabNameContext>
  );
}
