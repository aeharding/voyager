import { IonItem, IonToggle } from "@ionic/react";

import { useAppDispatch, useAppSelector } from "#/store";

import { setNeverShowReadPosts } from "../../settingsSlice";

export default function NeverShowReadPosts() {
  const dispatch = useAppDispatch();
  const neverShowReadPosts = useAppSelector(
    (state) => state.settings.general.posts.neverShowReadPosts,
  );

  return (
    <IonItem>
      <IonToggle
        checked={neverShowReadPosts}
        onIonChange={(e) => dispatch(setNeverShowReadPosts(e.detail.checked))}
      >
        Never Show Previously Read
      </IonToggle>
    </IonItem>
  );
}
