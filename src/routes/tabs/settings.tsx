/* eslint-disable react/jsx-key */

import Route from "../common/Route";
import SettingsPage from "../pages/settings/SettingsPage";
import InstallAppPage from "../pages/settings/InstallAppPage";
import UpdateAppPage from "../pages/settings/UpdateAppPage";
import GeneralPage from "../pages/settings/GeneralPage";
import HidingSettingsPage from "../pages/settings/HidingSettingsPage";
import AppearancePage from "../pages/settings/AppearancePage";
import AppearanceThemePage from "../pages/settings/AppearanceThemePage";
import DeviceModeSettingsPage from "../pages/settings/DeviceModeSettingsPage";
import AppIconPage from "../pages/settings/AppIconPage";
import BiometricPage from "../pages/settings/BiometricPage";
import GesturesPage from "../pages/settings/GesturesPage";
import BlocksSettingsPage from "../pages/settings/BlocksSettingsPage";
import RedditMigratePage from "../pages/settings/RedditDataMigratePage";
import SearchCommunitiesPage from "../pages/search/results/SearchCommunitiesPage";
import AboutPage from "../pages/settings/about/AboutPage";
import AboutThanksPage from "../pages/settings/about/AboutThanksPage";
import RedditMigrateSubsListPage from "../pages/settings/RedditMigrateSubsListPage";
import TagsSettingsPage from "../pages/settings/TagsSettingsPage";
import BrowseTagsPage from "../pages/settings/BrowseTagsPage";

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
