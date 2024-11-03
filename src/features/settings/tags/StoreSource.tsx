import { IonItem, IonToggle } from "@ionic/react";
import { setTagsSaveSource } from "../settingsSlice";
import { useAppDispatch, useAppSelector } from "../../../store";

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
