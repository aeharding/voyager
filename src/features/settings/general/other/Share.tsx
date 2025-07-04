import SettingSelector from "#/features/settings/shared/SettingSelector";
import {
  OPostCommentShareType,
  PostCommentShareType,
} from "#/services/db/types";
import { useAppSelector } from "#/store";

import { setDefaultShare } from "../../settingsSlice";

export default function Share() {
  const share = useAppSelector((state) => state.settings.general.defaultShare);

  return (
    <SettingSelector
      title="Share Links"
      openTitle="Share links to content with..."
      selected={share}
      setSelected={setDefaultShare}
      options={OPostCommentShareType}
      getOptionLabel={getLabel}
      getSelectedLabel={getShortLabel}
    />
  );
}

function getLabel(option: PostCommentShareType) {
  switch (option) {
    case OPostCommentShareType.ApId:
      return "Author Instance";
    case OPostCommentShareType.DeepLink:
      return "Voyager App (vger.to)";
    case OPostCommentShareType.Threadiverse:
      return "threadiverse.link";
    case OPostCommentShareType.Community:
      return "Community Instance";
    case OPostCommentShareType.Local:
      return "Local Instance";
    default:
      return undefined;
  }
}

function getShortLabel(option: PostCommentShareType) {
  return getLabel(option)?.split(" ")[0];
}
