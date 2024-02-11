import { useAppSelector } from "../../../../store";
import {
  OCommentThreadCollapse,
  setCommentsCollapsed,
} from "../../settingsSlice";
import SettingSelector from "../../shared/SettingSelector";

export default function CollapsedByDefault() {
  const { collapseCommentThreads } = useAppSelector(
    // this needs a better naming
    (state) => state.settings.general.comments,
  );

  return (
    <SettingSelector
      title="Collapse Comment Threads"
      selected={collapseCommentThreads}
      setSelected={setCommentsCollapsed}
      options={OCommentThreadCollapse}
    />
  );
}
