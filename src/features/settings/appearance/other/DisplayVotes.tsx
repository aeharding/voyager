import SettingSelector from "#/features/settings/shared/SettingSelector";
import { OVoteDisplayMode } from "#/services/db";
import { useAppSelector } from "#/store";

import { setVoteDisplayMode } from "../../settingsSlice";

export default function DisplayVotes() {
  const voteDisplayMode = useAppSelector(
    (state) => state.settings.appearance.voting.voteDisplayMode,
  );

  return (
    <SettingSelector
      title="Display Votes"
      selected={voteDisplayMode}
      setSelected={setVoteDisplayMode}
      options={OVoteDisplayMode}
    />
  );
}
