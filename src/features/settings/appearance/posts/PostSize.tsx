import { OPostAppearanceType, setPostAppearance } from "../../settingsSlice";
import { useAppSelector } from "../../../../store";
import SettingSelector from "../../shared/SettingSelector";
import { imageOutline, listOutline } from "ionicons/icons";

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
