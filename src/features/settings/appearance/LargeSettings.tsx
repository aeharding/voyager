import { IonLabel, IonList, IonToggle } from "@ionic/react";
import { InsetIonItem } from "../../user/Profile";
import { useAppSelector, useAppDispatch } from "../../../store";
import { setLargeShowVotingButtons } from "../settingsSlice";
import { ListHeader } from "../shared/formatting";

export default function LargeSettings() {
  const dispatch = useAppDispatch();
  const showVotingButtons = useAppSelector(
    (state) => state.settings.appearance.large.showVotingButtons,
  );

  return (
    <>
      <ListHeader>
        <IonLabel>Large Posts</IonLabel>
      </ListHeader>
      <IonList inset>
        <InsetIonItem>
          <IonToggle
            checked={showVotingButtons}
            onIonChange={(e) =>
              dispatch(setLargeShowVotingButtons(!!e.detail.checked))
            }
          >
            Show Voting Buttons
          </IonToggle>
        </InsetIonItem>
      </IonList>
    </>
  );
}
