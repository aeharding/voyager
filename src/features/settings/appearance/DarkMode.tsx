import styled from "@emotion/styled";
import { IonLabel, IonList, IonToggle } from "@ionic/react";
import { InsetIonItem } from "../../../pages/profile/ProfileFeedItemsPage";
import { useAppDispatch, useAppSelector } from "../../../store";
import { setUseSystemDarkMode } from "./appearanceSlice";
import UserDarkMode from "./UserDarkMode";

const ListHeader = styled.div`
  font-size: 0.8em;
  margin: 32px 0 -8px 32px;
  text-transform: uppercase;
  color: var(--ion-color-medium);
`;

export default function DarkMode() {
  const dispatch = useAppDispatch();
  const { usingSystemDarkMode } = useAppSelector(
    (state) => state.appearance.dark
  );

  return (
    <>
      <ListHeader>
        <IonLabel>System</IonLabel>
      </ListHeader>
      <IonList inset>
        <InsetIonItem>
          <IonLabel>Use System Light/Dark Mode</IonLabel>
          <IonToggle
            checked={usingSystemDarkMode}
            onIonChange={(e) =>
              dispatch(setUseSystemDarkMode(e.detail.checked))
            }
          />
        </InsetIonItem>
      </IonList>

      {!usingSystemDarkMode && <UserDarkMode />}
    </>
  );
}
