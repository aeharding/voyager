import { IonToggle } from "@ionic/react";
import { InsetIonItem } from "../../../../routes/pages/profile/ProfileFeedItemsPage";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { setUpvoteOnSave } from "../../settingsSlice";

export default function UpvoteOnSave() {
  const dispatch = useAppDispatch();
  const { upvoteOnSave } = useAppSelector(
    (state) => state.settings.general.posts,
  );

  return (
    <InsetIonItem>
      <IonToggle
        checked={upvoteOnSave}
        onIonChange={(e) => dispatch(setUpvoteOnSave(e.detail.checked))}
      >
        Upvote on Save
      </IonToggle>
    </InsetIonItem>
  );
}
