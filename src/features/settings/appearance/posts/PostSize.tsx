import { OPostAppearanceType, setPostAppearance } from "../../settingsSlice";
import { useAppSelector } from "../../../../store";
import SettingSelector from "../../shared/SettingSelector";

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
    />
  );
}
