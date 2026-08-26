import route from "#/routes/common/Route";
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
  route("/settings", <SettingsPage />),
  route("/settings/install", <InstallAppPage />),
  route("/settings/update", <UpdateAppPage />),
  route("/settings/general", <GeneralPage />),
  route("/settings/general/hiding", <HidingSettingsPage />),
  route("/settings/appearance", <AppearancePage />),
  route("/settings/appearance/theme", <AppearanceThemePage />),
  route("/settings/appearance/theme/mode", <DeviceModeSettingsPage />),
  route("/settings/app-icon", <AppIconPage />),
  route("/settings/biometric", <BiometricPage />),
  route("/settings/gestures", <GesturesPage />),
  route("/settings/blocks", <BlocksSettingsPage />),
  route("/settings/tags", <TagsSettingsPage />),
  route("/settings/tags/browse", <BrowseTagsPage />),
  route("/settings/reddit-migrate", <RedditMigratePage />),
  route("/settings/reddit-migrate/:link", <RedditMigrateSubsListPage />),
  route("/settings/reddit-migrate/:link/:search", <SearchCommunitiesPage />),
  route("/settings/about", <AboutPage />),
  route("/settings/about/thanks", <AboutThanksPage />),
];
