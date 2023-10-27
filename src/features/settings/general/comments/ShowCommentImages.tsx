import { IonLabel, IonToggle } from "@ionic/react";
import { InsetIonItem } from "../../../../pages/profile/ProfileFeedItemsPage";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { setShowCommentImages } from "../../settingsSlice";

export default function ShowCommentImages() {
  const dispatch = useAppDispatch();
  const { showCommentImages } = useAppSelector(
    // this needs a better naming
    (state) => state.settings.general.comments,
  );

  return (
    <InsetIonItem>
      <IonLabel>Show Comment Images</IonLabel>
      <IonToggle
        checked={showCommentImages}
        onIonChange={(e) => dispatch(setShowCommentImages(e.detail.checked))}
      />
    </InsetIonItem>
  );
}
