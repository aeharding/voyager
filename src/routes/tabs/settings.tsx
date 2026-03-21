import Route from "#/routes/common/Route";
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

export default [
  <Route path="/settings" element={<SettingsPage />} />,
  <Route path="/settings/install" element={<InstallAppPage />} />,
  <Route path="/settings/update" element={<UpdateAppPage />} />,
  <Route path="/settings/general" element={<GeneralPage />} />,
  <Route
    path="/settings/general/hiding"
    element={<HidingSettingsPage />}
  />,
  <Route path="/settings/appearance" element={<AppearancePage />} />,
  <Route
    path="/settings/appearance/theme"
    element={<AppearanceThemePage />}
  />,
  <Route
    path="/settings/appearance/theme/mode"
    element={<DeviceModeSettingsPage />}
  />,
  <Route path="/settings/app-icon" element={<AppIconPage />} />,
  <Route path="/settings/biometric" element={<BiometricPage />} />,
  <Route path="/settings/gestures" element={<GesturesPage />} />,
  <Route path="/settings/blocks" element={<BlocksSettingsPage />} />,
  <Route path="/settings/tags" element={<TagsSettingsPage />} />,
  <Route path="/settings/tags/browse" element={<BrowseTagsPage />} />,
  <Route path="/settings/reddit-migrate" element={<RedditMigratePage />} />,
  <Route
    path="/settings/reddit-migrate/:link"
    element={<RedditMigrateSubsListPage />}
  />,
  <Route
    path="/settings/reddit-migrate/:link/:search"
    element={<SearchCommunitiesPage />}
  />,
  <Route path="/settings/about" element={<AboutPage />} />,
  <Route path="/settings/about/thanks" element={<AboutThanksPage />} />,
];
