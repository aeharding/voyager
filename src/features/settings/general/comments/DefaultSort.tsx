import { useAppSelector } from "../../../../store";
import { OCommentDefaultSort } from "../../../../services/db";
import { setDefaultCommentSort } from "../../settingsSlice";
import SettingSelector from "../../shared/SettingSelector";
import { getSortIcon } from "../../../comment/CommentSort";
import { mapValues } from "lodash";
import useSupported from "../../../../helpers/useSupported";

export default function DefaultSort() {
  const defaultCommentSort = useAppSelector(
    (state) => state.settings.general.comments.sort,
  );
  const newSorts = useSupported("v0.19 Sorts");

  const options: Partial<typeof OCommentDefaultSort> = {
    ...OCommentDefaultSort,
  };
  if (!newSorts) delete options["Controversial"];

  return (
    <SettingSelector
      title="Default Sort"
      selected={defaultCommentSort}
      setSelected={setDefaultCommentSort}
      options={options}
      optionIcons={mapValues(OCommentDefaultSort, getSortIcon)}
    />
  );
}
