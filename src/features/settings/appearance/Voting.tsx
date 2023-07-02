import styled from "@emotion/styled";
import { IonLabel, IonList, IonToggle } from "@ionic/react";
import { InsetIonItem } from "../../../pages/profile/ProfileFeedItemsPage";
import { useAppDispatch, useAppSelector } from "../../../store";
import { OVoteDisplayMode } from "../../../services/db";
import { setVoteDisplayMode } from "../settingsSlice";

export const ListHeader = styled.div`
  font-size: 0.8em;
  margin: 32px 0 -8px 32px;
  text-transform: uppercase;
  color: var(--ion-color-medium);
`;

export default function CollapsedByDefault() {
  const dispatch = useAppDispatch();
  const { voteDisplayMode } = useAppSelector(
    // this needs a better naming
    (state) => state.settings.appearance.voting
  );

  return (
    <>
      <ListHeader>
        <IonLabel>Voting</IonLabel>
      </ListHeader>
      <IonList inset>
        <InsetIonItem>
          <IonLabel>Show downvotes separately</IonLabel>
          <IonToggle
            checked={voteDisplayMode === OVoteDisplayMode.Separate}
            onIonChange={(e) =>
              dispatch(
                setVoteDisplayMode(
                  e.detail.checked
                    ? OVoteDisplayMode.Separate
                    : OVoteDisplayMode.SingleScore
                )
              )
            }
          />
        </InsetIonItem>
      </IonList>
    </>
  );
}
