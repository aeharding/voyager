import { mapValues } from "es-toolkit";

import { getSortIcon } from "#/features/comment/CommentSort";
import SettingSelector from "#/features/settings/shared/SettingSelector";
import { OCommentDefaultSort } from "#/services/db";
import { useAppSelector } from "#/store";

import { setDefaultCommentSort } from "../../settingsSlice";

export default function DefaultSort() {
  const defaultCommentSort = useAppSelector(
    (state) => state.settings.general.comments.sort,
  );

  return (
    <SettingSelector
      title="Default Sort"
      openTitle="Default Comments Sort..."
      selected={defaultCommentSort}
      setSelected={setDefaultCommentSort}
      options={OCommentDefaultSort}
      optionIcons={mapValues(OCommentDefaultSort, getSortIcon)}
    />
  );
}
