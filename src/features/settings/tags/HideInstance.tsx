import { IonItem, IonToggle } from "@ionic/react";

import { useAppDispatch, useAppSelector } from "../../../store";
import { setTagsHideInstance } from "../settingsSlice";

export default function HideInstance() {
  const dispatch = useAppDispatch();
  const hideInstance = useAppSelector(
    (state) => state.settings.tags.hideInstance,
  );

  return (
    <IonItem>
      <IonToggle
        checked={hideInstance}
        onIonChange={(e) => dispatch(setTagsHideInstance(e.detail.checked))}
      >
        Hide Instance When Tagged
      </IonToggle>
    </IonItem>
  );
}
