import { IonLabel, IonToggle } from "@ionic/react";
import { InsetIonItem } from "../../../../pages/profile/ProfileFeedItemsPage";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { setRenderCommentImages } from "../../settingsSlice";

export default function RenderCommentImages() {
  const dispatch = useAppDispatch();
  const { renderCommentImages } = useAppSelector(
    // this needs a better naming
    (state) => state.settings.general.comments,
  );

  return (
    <InsetIonItem>
      <IonLabel>Render Comment Images</IonLabel>
      <IonToggle
        checked={renderCommentImages}
        onIonChange={(e) => dispatch(setRenderCommentImages(e.detail.checked))}
      />
    </InsetIonItem>
  );
}
