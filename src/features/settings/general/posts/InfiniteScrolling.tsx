import { IonItem, IonToggle } from "@ionic/react";

import { useAppDispatch, useAppSelector } from "#/store";

import { setInfiniteScrolling } from "../../settingsSlice";

export default function InfiniteScrolling() {
  const dispatch = useAppDispatch();
  const infiniteScrolling = useAppSelector(
    (state) => state.settings.general.posts.infiniteScrolling,
  );

  return (
    <IonItem>
      <IonToggle
        checked={infiniteScrolling}
        onIonChange={(e) => dispatch(setInfiniteScrolling(e.detail.checked))}
      >
        Infinite Scrolling
      </IonToggle>
    </IonItem>
  );
}
