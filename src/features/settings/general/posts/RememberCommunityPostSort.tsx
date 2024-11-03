import { IonItem, IonToggle } from "@ionic/react";

import { useAppDispatch, useAppSelector } from "#/store";

import { setRememberCommunityPostSort } from "../../settingsSlice";

export default function RememberCommunityPostSort() {
  const dispatch = useAppDispatch();
  const rememberCommunitySort = useAppSelector(
    (state) => state.settings.general.posts.rememberCommunitySort,
  );

  return (
    <IonItem>
      <IonToggle
        checked={rememberCommunitySort}
        onIonChange={(e) =>
          dispatch(setRememberCommunityPostSort(e.detail.checked))
        }
      >
        Remember Community Sort
      </IonToggle>
    </IonItem>
  );
}
