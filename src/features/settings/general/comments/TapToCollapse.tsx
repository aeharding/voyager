import SettingSelector from "#/features/settings/shared/SettingSelector";
import { OTapToCollapseType } from "#/services/db";
import { useAppSelector } from "#/store";

import { setTapToCollapse } from "../../settingsSlice";

export default function TapToCollapse() {
  const { tapToCollapse } = useAppSelector(
    (state) => state.settings.general.comments,
  );

  return (
    <SettingSelector
      title="Tap To Collapse..."
      selected={tapToCollapse}
      setSelected={setTapToCollapse}
      options={OTapToCollapseType}
    />
  );
}
