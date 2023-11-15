import { IonLabel, IonList } from "@ionic/react";
import { useAppSelector } from "../../../store";
import { setVoteDisplayMode } from "../settingsSlice";
import { OVoteDisplayMode } from "../../../services/db";
import SettingSelector from "../shared/SettingSelector";
import { ListHeader } from "../shared/formatting";

export default function Votes() {
  const voteDisplayMode = useAppSelector(
    (state) => state.settings.appearance.voting.voteDisplayMode,
  );

  return (
    <>
      <ListHeader>
        <IonLabel>Votes</IonLabel>
      </ListHeader>
      <IonList inset>
        <SettingSelector
          title="Display Votes"
          selected={voteDisplayMode}
          setSelected={setVoteDisplayMode}
          options={OVoteDisplayMode}
        />
      </IonList>
    </>
  );
}
