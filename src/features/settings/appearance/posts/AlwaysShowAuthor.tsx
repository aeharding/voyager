import { IonItem, IonToggle } from "@ionic/react";

import { useAppDispatch, useAppSelector } from "#/store";

import { setAlwaysShowAuthor } from "../../settingsSlice";

export default function AlwaysShowAuthor() {
  const dispatch = useAppDispatch();
  const alwaysShowAuthor = useAppSelector(
    (state) => state.settings.appearance.posts.alwaysShowAuthor,
  );

  return (
    <IonItem>
      <IonToggle
        checked={alwaysShowAuthor}
        onIonChange={(e) => dispatch(setAlwaysShowAuthor(e.detail.checked))}
      >
        Always Show Author
      </IonToggle>
    </IonItem>
  );
}
