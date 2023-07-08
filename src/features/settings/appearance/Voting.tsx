import { IonLabel, IonList } from "@ionic/react";
import { useAppSelector } from "../../../store";
import { setVoteDisplayMode } from "../settingsSlice";
import { OVoteDisplayMode, VoteDisplayMode } from "../../../services/db";
import SettingSelector from "../shared/SettingSelector";
import { ListHeader } from "../shared/formatting";

export default function CollapsedByDefault() {
  const voteDisplayMode = useAppSelector(
    (state) => state.settings.appearance.voting.voteDisplayMode
  );

  const Selector = SettingSelector<VoteDisplayMode>;

  return (
    <>
      <ListHeader>
        <IonLabel>Voting</IonLabel>
      </ListHeader>
      <IonList inset>
        <Selector
          title="Voting Display Mode"
          selected={voteDisplayMode}
          set_selected={setVoteDisplayMode}
          options={OVoteDisplayMode}
        />
      </IonList>
    </>
  );
}
