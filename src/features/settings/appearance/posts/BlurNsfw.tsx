import SettingSelector from "#/features/settings/shared/SettingSelector";
import { OPostBlurNsfw } from "#/services/db";
import { useAppSelector } from "#/store";

import { setBlurNsfwState } from "../../settingsSlice";

export default function BlurNsfw() {
  const nsfwBlurred = useAppSelector(
    (state) => state.settings.appearance.posts.blurNsfw,
  );

  return (
    <SettingSelector
      title="Blur NSFW"
      selected={nsfwBlurred}
      setSelected={setBlurNsfwState}
      options={OPostBlurNsfw}
    />
  );
}
