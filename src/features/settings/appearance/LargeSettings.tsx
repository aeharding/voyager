import { IonItem, IonLabel, IonList, IonToggle } from "@ionic/react";

import { ListHeader } from "#/features/settings/shared/formatting";
import { useAppDispatch, useAppSelector } from "#/store";

import { setLargeShowVotingButtons } from "../settingsSlice";

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
        <IonItem>
          <IonToggle
            checked={showVotingButtons}
            onIonChange={(e) =>
              dispatch(setLargeShowVotingButtons(!!e.detail.checked))
            }
          >
            Show Voting Buttons
          </IonToggle>
        </IonItem>
      </IonList>
    </>
  );
}
