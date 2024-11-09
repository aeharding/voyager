import SettingSelector from "#/features/settings/shared/SettingSelector";
import { OJumpButtonPositionType } from "#/services/db";
import { useAppSelector } from "#/store";

import { setJumpButtonPosition } from "../../settingsSlice";

export default function JumpButtonPosition() {
  const { jumpButtonPosition } = useAppSelector(
    (state) => state.settings.general.comments,
  );

  return (
    <SettingSelector
      title="Jump Button Position"
      selected={jumpButtonPosition}
      setSelected={setJumpButtonPosition}
      options={OJumpButtonPositionType}
    />
  );
}
