import SettingSelector from "#/features/settings/shared/SettingSelector";
import { OProfileLabelType, ProfileLabelType } from "#/services/db";
import { useAppSelector } from "#/store";

import { setProfileLabel } from "../../settingsSlice";

export default function ProfileTabLabel() {
  const profileLabel = useAppSelector(
    (state) => state.settings.appearance.general.profileLabel,
  );

  return (
    <SettingSelector
      title="Profile Tab Label"
      selected={profileLabel}
      setSelected={setProfileLabel}
      options={OProfileLabelType}
    />
  );
}

export function getProfileTabLabel(
  profileLabelType: ProfileLabelType,
  handle: string | undefined,
  connectedInstance: string,
) {
  switch (profileLabelType) {
    case OProfileLabelType.Hide:
      return "Profile";
    case OProfileLabelType.Handle:
      if (!handle) return connectedInstance;

      return handle;
    case OProfileLabelType.Username:
      if (!handle) return connectedInstance;

      return handle.slice(0, handle.lastIndexOf("@"));
    default:
      return connectedInstance;
  }
}
