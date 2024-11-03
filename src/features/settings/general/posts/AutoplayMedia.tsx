import SettingSelector from "#/features/settings/shared/SettingSelector";
import { isInstalled } from "#/helpers/device";
import { OAutoplayMediaType } from "#/services/db";
import { useAppSelector } from "#/store";

import { setAutoplayMedia } from "../../settingsSlice";

export default function AutoplayMedia() {
  const autoplayMedia = useAppSelector(
    (state) => state.settings.general.posts.autoplayMedia,
  );

  return (
    <SettingSelector
      title="Autoplay GIFs/Videos"
      selected={autoplayMedia}
      setSelected={setAutoplayMedia}
      options={OAutoplayMediaType}
      hideOptions={isInstalled() ? undefined : [OAutoplayMediaType.WifiOnly]}
    />
  );
}
