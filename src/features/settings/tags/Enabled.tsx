import { IonItem, IonText, IonToggle } from "@ionic/react";

import { useAppDispatch, useAppSelector } from "../../../store";
import { setTagsEnabled } from "../settingsSlice";

export default function Enabled() {
  const dispatch = useAppDispatch();
  const enabled = useAppSelector((state) => state.settings.tags.enabled);

  return (
    <IonItem>
      <IonToggle
        checked={enabled}
        onIonChange={(e) => dispatch(setTagsEnabled(e.detail.checked))}
      >
        Enable User Tags <IonText color="medium">(experimental)</IonText>
      </IonToggle>
    </IonItem>
  );
}
