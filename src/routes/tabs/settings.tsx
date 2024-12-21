/* eslint-disable react/jsx-key */
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
  <Route exact path="/settings">
    <SettingsPage />
  </Route>,
  <Route exact path="/settings/install">
    <InstallAppPage />
  </Route>,
  <Route exact path="/settings/update">
    <UpdateAppPage />
  </Route>,
  <Route exact path="/settings/general">
    <GeneralPage />
  </Route>,
  <Route exact path="/settings/general/hiding">
    <HidingSettingsPage />
  </Route>,
  <Route exact path="/settings/appearance">
    <AppearancePage />
  </Route>,
  <Route exact path="/settings/appearance/theme">
    <AppearanceThemePage />
  </Route>,
  <Route exact path="/settings/appearance/theme/mode">
    <DeviceModeSettingsPage />
  </Route>,
  <Route exact path="/settings/app-icon">
    <AppIconPage />
  </Route>,
  <Route exact path="/settings/biometric">
    <BiometricPage />
  </Route>,
  <Route exact path="/settings/gestures">
    <GesturesPage />
  </Route>,
  <Route exact path="/settings/blocks">
    <BlocksSettingsPage />
  </Route>,
  <Route exact path="/settings/tags">
    <TagsSettingsPage />
  </Route>,
  <Route exact path="/settings/tags/browse">
    <BrowseTagsPage />
  </Route>,
  <Route exact path="/settings/reddit-migrate">
    <RedditMigratePage />
  </Route>,
  <Route exact path="/settings/reddit-migrate/:link">
    <RedditMigrateSubsListPage />
  </Route>,
  <Route exact path="/settings/reddit-migrate/:link/:search">
    <SearchCommunitiesPage />
  </Route>,
  <Route exact path="/settings/about">
    <AboutPage />
  </Route>,
  <Route exact path="/settings/about/thanks">
    <AboutThanksPage />
  </Route>,
];
