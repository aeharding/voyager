import SettingSelector from "#/features/settings/shared/SettingSelector";
import { useAppSelector } from "#/store";

import {
  OCommentThreadCollapse,
  setCommentsCollapsed,
} from "../../settingsSlice";

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
