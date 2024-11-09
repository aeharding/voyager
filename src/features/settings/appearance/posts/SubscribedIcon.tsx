import { startCase } from "es-toolkit";

import SettingSelector from "#/features/settings/shared/SettingSelector";
import { OShowSubscribedIcon } from "#/services/db";
import { useAppSelector } from "#/store";

import { setSubscribedIcon } from "../../settingsSlice";

export default function SubscribedIcon() {
  const subscribedIcon = useAppSelector(
    (state) => state.settings.appearance.posts.subscribedIcon,
  );

  return (
    <SettingSelector
      title="Show Subscribed Icon"
      selected={subscribedIcon}
      setSelected={setSubscribedIcon}
      options={OShowSubscribedIcon}
      getOptionLabel={(option) => {
        if (option === OShowSubscribedIcon.OnlyAllLocal) return "All/Local";
        return startCase(option);
      }}
    />
  );
}
