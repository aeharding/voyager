import {
  IonItem,
  IonLabel,
  IonList,
  IonRadio,
  IonRadioGroup,
} from "@ionic/react";
import { useAppDispatch, useAppSelector } from "../../../../../store";
import { setUserDarkMode } from "../../../settingsSlice";
import { ListHeader } from "../../../shared/formatting";

export default function UserDarkMode() {
  const dispatch = useAppDispatch();
  const userDarkMode = useAppSelector(
    (state) => state.settings.appearance.dark.userDarkMode,
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
          <IonItem>
            <IonRadio value={false}>Light</IonRadio>
          </IonItem>
          <IonItem>
            <IonRadio value={true}>Dark</IonRadio>
          </IonItem>
        </IonList>
      </IonRadioGroup>
    </>
  );
}
