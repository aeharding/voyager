import { IonItem, IonText, IonToggle } from "@ionic/react";
import { setTagsEnabled } from "../settingsSlice";
import { useAppDispatch, useAppSelector } from "../../../store";

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
