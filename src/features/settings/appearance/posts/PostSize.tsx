import { imageOutline, listOutline } from "ionicons/icons";

import SettingSelector from "#/features/settings/shared/SettingSelector";
import { useAppSelector } from "#/store";

import { OPostAppearanceType, setPostAppearance } from "../../settingsSlice";

export default function PostSize() {
  const postsAppearanceType = useAppSelector(
    (state) => state.settings.appearance.posts.type,
  );

  return (
    <SettingSelector
      title="Post Size"
      selected={postsAppearanceType}
      setSelected={setPostAppearance}
      options={OPostAppearanceType}
      optionIcons={{
        [OPostAppearanceType.Compact]: listOutline,
        [OPostAppearanceType.Large]: imageOutline,
      }}
    />
  );
}
