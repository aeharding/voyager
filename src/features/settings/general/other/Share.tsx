import SettingSelector from "#/features/settings/shared/SettingSelector";
import { OPostCommentShareType, PostCommentShareType } from "#/services/db";
import { useAppSelector } from "#/store";

import { setDefaultShare } from "../../settingsSlice";

export default function Share() {
  const share = useAppSelector((state) => state.settings.general.defaultShare);

  return (
    <SettingSelector
      title="Share Link Instance"
      openTitle="Share Link Lemmy Instance"
      selected={share}
      setSelected={setDefaultShare}
      options={OPostCommentShareType}
      getOptionLabel={getLabel}
      getSelectedLabel={getLabel}
    />
  );
}

function getLabel(option: PostCommentShareType) {
  switch (option) {
    case OPostCommentShareType.ApId:
      return "Author";
    default:
      return undefined;
  }
}
