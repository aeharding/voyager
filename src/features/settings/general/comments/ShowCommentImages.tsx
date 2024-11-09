import { IonItem, IonToggle } from "@ionic/react";

import { useAppDispatch, useAppSelector } from "#/store";

import { setShowCommentImages } from "../../settingsSlice";

export default function ShowCommentImages() {
  const dispatch = useAppDispatch();
  const { showCommentImages } = useAppSelector(
    // this needs a better naming
    (state) => state.settings.general.comments,
  );

  return (
    <IonItem>
      <IonToggle
        checked={showCommentImages}
        onIonChange={(e) => dispatch(setShowCommentImages(e.detail.checked))}
      >
        Show Comment Images
      </IonToggle>
    </IonItem>
  );
}
