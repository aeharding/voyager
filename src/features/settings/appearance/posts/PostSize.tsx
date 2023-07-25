import {
  OPostAppearanceType,
  PostAppearanceType,
  setPostAppearance,
} from "../../settingsSlice";
import { useAppSelector } from "../../../../store";
import SettingSelector from "../../shared/SettingSelector";

export default function PostSize() {
  const postsAppearanceType = useAppSelector(
    (state) => state.settings.appearance.posts.type
  );

  const PostSizeSelector = SettingSelector<PostAppearanceType>;

  return (
    <PostSizeSelector
      title="Post Size"
      selected={postsAppearanceType}
      setSelected={setPostAppearance}
      options={OPostAppearanceType}
    />
  );
}
