import { OVoteDisplayMode } from "../../../../services/db";
import { useAppSelector } from "../../../../store";
import { setVoteDisplayMode } from "../../settingsSlice";
import SettingSelector from "../../shared/SettingSelector";

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
