import styled from "@emotion/styled";
import { IonLabel, IonList, IonRadio, IonRadioGroup } from "@ionic/react";
import { InsetIonItem } from "../../../pages/profile/ProfileFeedItemsPage";
import { useAppDispatch, useAppSelector } from "../../../store";
import { setUserDarkMode } from "./appearanceSlice";

const ListHeader = styled.div`
  font-size: 0.8em;
  margin: 32px 0 -8px 32px;
  text-transform: uppercase;
  color: var(--ion-color-medium);
`;

export default function UserDarkMode() {
  const dispatch = useAppDispatch();
  const userDarkMode = useAppSelector(
    (state) => state.appearance.dark.userDarkMode
  );

  return (
    <>
      <ListHeader>
        <IonLabel>Light/Dark Mode</IonLabel>
      </ListHeader>
      <IonRadioGroup
        value={userDarkMode}
        onIonChange={(e) => dispatch(setUserDarkMode(e.detail.value))}
      >
        <IonList inset>
          <InsetIonItem>
            <IonLabel>Light</IonLabel>
            <IonRadio value={false} />
          </InsetIonItem>
          <InsetIonItem>
            <IonLabel>Dark</IonLabel>
            <IonRadio value={true} />
          </InsetIonItem>
        </IonList>
      </IonRadioGroup>
    </>
  );
}
