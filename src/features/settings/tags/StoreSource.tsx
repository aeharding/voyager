import { IonItem, IonToggle } from "@ionic/react";

import { useAppDispatch, useAppSelector } from "../../../store";
import { setTagsSaveSource } from "../settingsSlice";

export default function StoreSource() {
  const dispatch = useAppDispatch();
  const saveSource = useAppSelector((state) => state.settings.tags.saveSource);

  return (
    <IonItem>
      <IonToggle
        checked={saveSource}
        onIonChange={(e) => dispatch(setTagsSaveSource(e.detail.checked))}
      >
        Store Source Link
      </IonToggle>
    </IonItem>
  );
}
