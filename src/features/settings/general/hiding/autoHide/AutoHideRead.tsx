import { IonItem, IonToggle } from "@ionic/react";

import { useAppDispatch, useAppSelector } from "#/store";

import { setAutoHideRead } from "../../../settingsSlice";

export default function AutoHideRead() {
  const dispatch = useAppDispatch();
  const autoHideRead = useAppSelector(
    (state) => state.settings.general.posts.autoHideRead,
  );

  return (
    <IonItem>
      <IonToggle
        checked={autoHideRead}
        onIonChange={(e) => dispatch(setAutoHideRead(e.detail.checked))}
      >
        Auto Hide Read Posts
      </IonToggle>
    </IonItem>
  );
}
