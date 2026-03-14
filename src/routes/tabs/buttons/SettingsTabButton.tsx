import { IonBadge, IonIcon, IonLabel } from "@ionic/react";
import { cog } from "ionicons/icons";
import { use } from "react";

import useShouldInstall from "#/features/pwa/useShouldInstall";
import { hasErrorsSelector } from "#/features/settings/settingsSlice";
import { UpdateContext } from "#/routes/pages/settings/update/UpdateContext";
import { useAppSelector } from "#/store";

import SharedTabButton, { TabButtonProps } from "./shared";

function SettingsTabButton(props: TabButtonProps) {
  const hasErrors = useAppSelector(hasErrorsSelector);

  const { status: updateStatus } = use(UpdateContext);
  const shouldInstall = useShouldInstall();

  const settingsNotificationCount =
    (shouldInstall ? 1 : 0) + (updateStatus === "outdated" ? 1 : 0);

  const settingsBadge = (() => {
    if (hasErrors) return <IonBadge color="danger">!</IonBadge>;

    if (settingsNotificationCount)
      return <IonBadge color="danger">{settingsNotificationCount}</IonBadge>;
  })();

  return (
    <SharedTabButton {...props}>
      <IonIcon aria-hidden="true" icon={cog} />
      <IonLabel>Settings</IonLabel>
      {settingsBadge}
    </SharedTabButton>
  );
}

/**
 * Signal to Ionic that this is a tab bar button component
 */
SettingsTabButton.isTabButton = true;

export default SettingsTabButton;
