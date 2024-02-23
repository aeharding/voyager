import { useAppSelector } from "../../../../store";
import {
  OCommentThreadCollapse,
  setCommentsCollapsed,
} from "../../settingsSlice";
import SettingSelector from "../../shared/SettingSelector";

export default function CollapsedByDefault() {
  const collapseCommentThreads = useAppSelector(
    (state) => state.settings.general.comments.collapseCommentThreads,
  );

  return (
    <SettingSelector
      title="Collapse Threads"
      selected={collapseCommentThreads}
      setSelected={setCommentsCollapsed}
      options={OCommentThreadCollapse}
    />
  );
}
