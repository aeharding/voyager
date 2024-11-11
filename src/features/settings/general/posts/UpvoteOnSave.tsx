import { IonItem, IonToggle } from "@ionic/react";

import { useAppDispatch, useAppSelector } from "#/store";

import { setUpvoteOnSave } from "../../settingsSlice";

export default function UpvoteOnSave() {
  const dispatch = useAppDispatch();
  const { upvoteOnSave } = useAppSelector(
    (state) => state.settings.general.posts,
  );

  return (
    <IonItem>
      <IonToggle
        checked={upvoteOnSave}
        onIonChange={(e) => dispatch(setUpvoteOnSave(e.detail.checked))}
      >
        Upvote on Save
      </IonToggle>
    </IonItem>
  );
}
