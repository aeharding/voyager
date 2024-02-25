import { IonToggle } from "@ionic/react";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { InsetIonItem } from "../../shared/formatting";
import { setShowCollapsedComment } from "../../settingsSlice";

export default function ShowCollapsed() {
  const dispatch = useAppDispatch();
  const showCollapsedComment = useAppSelector(
    (state) => state.settings.general.comments.showCollapsed,
  );

  return (
    <InsetIonItem>
      <IonToggle
        checked={showCollapsedComment}
        onIonChange={(e) => dispatch(setShowCollapsedComment(e.detail.checked))}
      >
        Show Collapsed Comment
      </IonToggle>
    </InsetIonItem>
  );
}
