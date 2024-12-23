import { IonItem, IonToggle } from "@ionic/react";

import { useAppDispatch, useAppSelector } from "#/store";

import { setHideAltText } from "../../settingsSlice";

export default function HideAltText() {
  const dispatch = useAppDispatch();
  const hideAltText = useAppSelector(
    (state) => state.settings.general.media.hideAltText,
  );

  return (
    <IonItem>
      <IonToggle
        checked={hideAltText}
        onIonChange={(e) => dispatch(setHideAltText(e.detail.checked))}
      >
        Hide Accessible Captions
      </IonToggle>
    </IonItem>
  );
}
