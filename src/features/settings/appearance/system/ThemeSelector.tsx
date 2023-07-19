import styled from "@emotion/styled";
import { IonLabel, IonList, IonRadio, IonRadioGroup } from "@ionic/react";
import { InsetIonItem } from "../../../../pages/profile/ProfileFeedItemsPage";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { setTheme } from "../../settingsSlice";

const ListHeader = styled.div`
  font-size: 0.8em;
  margin: 32px 0 -8px 32px;
  text-transform: uppercase;
  color: var(--ion-color-medium);
`;

export default function ThemeSelector() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.settings.appearance.theme);

  return (
    <>
      <ListHeader>
        <IonLabel>Theme</IonLabel>
      </ListHeader>
      <IonRadioGroup
        value={theme}
        onIonChange={(e) => dispatch(setTheme(e.detail.value))}
      >
        <IonList inset>
          <InsetIonItem>
            <IonLabel>System</IonLabel>
            <IonRadio value="system" />
          </InsetIonItem>
          <InsetIonItem>
            <IonLabel>Light</IonLabel>
            <IonRadio value="light" />
          </InsetIonItem>
          <InsetIonItem>
            <IonLabel>Dark</IonLabel>
            <IonRadio value="dark" />
          </InsetIonItem>
          <InsetIonItem>
            <IonLabel>Black</IonLabel>
            <IonRadio value="black" />
          </InsetIonItem>
        </IonList>
      </IonRadioGroup>
    </>
  );
}
