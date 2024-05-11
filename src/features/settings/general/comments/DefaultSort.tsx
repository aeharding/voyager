import { useAppSelector } from "../../../../store";
import { OCommentDefaultSort } from "../../../../services/db";
import { setDefaultCommentSort } from "../../settingsSlice";
import SettingSelector from "../../shared/SettingSelector";
import { getSortIcon } from "../../../comment/CommentSort";
import { mapValues } from "lodash";

export default function DefaultSort() {
  const defaultCommentSort = useAppSelector(
    (state) => state.settings.general.comments.sort,
  );

  return (
    <SettingSelector
      title="Default Sort"
      openTitle="Default Comment Sort"
      selected={defaultCommentSort}
      setSelected={setDefaultCommentSort}
      options={OCommentDefaultSort}
      optionIcons={mapValues(OCommentDefaultSort, getSortIcon)}
    />
  );
}
