import { IonItem, IonToggle } from "@ionic/react";

import { useAppDispatch, useAppSelector } from "#/store";

import { setMarkPostsReadOnScroll } from "../../settingsSlice";

export default function MarkReadOnScroll() {
  const dispatch = useAppDispatch();
  const { markReadOnScroll } = useAppSelector(
    (state) => state.settings.general.posts,
  );

  return (
    <IonItem>
      <IonToggle
        checked={markReadOnScroll}
        onIonChange={(e) =>
          dispatch(setMarkPostsReadOnScroll(e.detail.checked))
        }
      >
        Mark Read on Scroll
      </IonToggle>
    </IonItem>
  );
}
