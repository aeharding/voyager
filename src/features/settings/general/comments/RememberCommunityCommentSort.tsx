import { IonItem, IonToggle } from "@ionic/react";

import { useAppDispatch, useAppSelector } from "#/store";

import { setRememberCommunityCommentSort } from "../../settingsSlice";

export default function RememberCommunityCommentSort() {
  const dispatch = useAppDispatch();
  const rememberCommunitySort = useAppSelector(
    (state) => state.settings.general.comments.rememberCommunitySort,
  );

  return (
    <IonItem>
      <IonToggle
        checked={rememberCommunitySort}
        onIonChange={(e) =>
          dispatch(setRememberCommunityCommentSort(e.detail.checked))
        }
      >
        Remember Community Sort
      </IonToggle>
    </IonItem>
  );
}
