import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { IonLabel, IonList, IonToggle } from "@ionic/react";
import { InsetIonItem } from "../../../pages/profile/ProfileFeedItemsPage";
import { useAppDispatch, useAppSelector } from "../../../store";
import { setUserDarkMode, setUseSystemDarkMode } from "./appearanceSlice";

const ListHeader = styled.div`
  font-size: 0.8em;
  margin: 32px 0 -8px 32px;
  text-transform: uppercase;
  color: var(--ion-color-medium);
`;

export default function DarkMode() {
  const dispatch = useAppDispatch();
  const { userDarkMode, usingDeviceDarkMode: useSystemDarkMode } =
    useAppSelector((state) => state.appearance.dark);

  return (
    <>
      <ListHeader>
        <IonLabel>System</IonLabel>
      </ListHeader>
      <IonList inset>
        <InsetIonItem>
          <IonLabel>Use System Light/Dark Mode</IonLabel>
          <IonToggle
            checked={useSystemDarkMode}
            onIonChange={(e) =>
              dispatch(setUseSystemDarkMode(e.detail.checked))
            }
          />
        </InsetIonItem>
        <InsetIonItem disabled={useSystemDarkMode}>
          <IonLabel>Always Use Dark Mode</IonLabel>
          <IonToggle
            checked={userDarkMode}
            onIonChange={(e) => dispatch(setUserDarkMode(e.detail.checked))}
          />
        </InsetIonItem>
      </IonList>
    </>
  );
}
