import { IonItem, IonToggle } from "@ionic/react";

import { useAppDispatch, useAppSelector } from "../../../../store";
import { setRememberCommunitySort } from "../../settingsSlice";

export default function RememberCommunitySort() {
  const dispatch = useAppDispatch();
  const infiniteScrolling = useAppSelector(
    (state) => state.settings.general.posts.rememberCommunitySort,
  );

  return (
    <IonItem>
      <IonToggle
        checked={infiniteScrolling}
        onIonChange={(e) =>
          dispatch(setRememberCommunitySort(e.detail.checked))
        }
      >
        Remember Community Sort
      </IonToggle>
    </IonItem>
  );
}
