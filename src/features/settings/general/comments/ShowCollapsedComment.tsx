import { IonLabel, IonToggle } from "@ionic/react";
import { InsetIonItem } from "../../../../pages/profile/ProfileFeedItemsPage";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { setShowCollapsedComment } from "../../settingsSlice";

export default function ShowCollapsedComment() {
  const dispatch = useAppDispatch();
  const showCollapsedComment = useAppSelector(
    (state) => state.settings.general.comments.showCollapsedComment
  );

  return (
    <InsetIonItem>
      <IonLabel>Show Collapsed Comment</IonLabel>
      <IonToggle
        checked={showCollapsedComment}
        onIonChange={(e) => dispatch(setShowCollapsedComment(e.detail.checked))}
      />
    </InsetIonItem>
  );
}
