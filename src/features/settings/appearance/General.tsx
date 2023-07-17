import styled from "@emotion/styled";
import { IonLabel, IonList, IonToggle } from "@ionic/react";
import { InsetIonItem } from "../../../pages/profile/ProfileFeedItemsPage";
import { useAppDispatch, useAppSelector } from "../../../store";
import { setUserInstanceUrlDisplay } from "../settingsSlice";
import { OInstanceUrlDisplayMode } from "../../../services/db";

export const ListHeader = styled.div`
  font-size: 0.8em;
  margin: 32px 0 -8px 32px;
  text-transform: uppercase;
  color: var(--ion-color-medium);
`;

export default function GeneralAppearance() {
  const dispatch = useAppDispatch();
  const userInstanceUrlDisplay = useAppSelector(
    (state) => state.settings.appearance.general.userInstanceUrlDisplay
  );

  return (
    <>
      <ListHeader>
        <IonLabel>General</IonLabel>
      </ListHeader>
      <IonList inset>
        <InsetIonItem>
          <IonLabel>Show user instance</IonLabel>
          <IonToggle
            checked={
              userInstanceUrlDisplay === OInstanceUrlDisplayMode.WhenRemote
            }
            onIonChange={(e) =>
              dispatch(
                setUserInstanceUrlDisplay(
                  e.detail.checked
                    ? OInstanceUrlDisplayMode.WhenRemote
                    : OInstanceUrlDisplayMode.Never
                )
              )
            }
          />
        </InsetIonItem>
      </IonList>
    </>
  );
}
