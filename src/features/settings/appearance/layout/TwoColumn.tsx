import { IonItem, IonText, IonToggle } from "@ionic/react";

import { useAppDispatch, useAppSelector } from "#/store";

import { setTwoColumnLayout } from "../../settingsSlice";

export default function ShowUserInstance() {
  const dispatch = useAppDispatch();
  const twoColumnLayout = useAppSelector(
    (state) => state.settings.appearance.general.twoColumnLayout,
  );

  return (
    <IonItem>
      <IonToggle
        checked={twoColumnLayout}
        onIonChange={(e) => dispatch(setTwoColumnLayout(e.detail.checked))}
      >
        2 Column Mode <IonText color="medium">(experimental)</IonText>
      </IonToggle>
    </IonItem>
  );
}
