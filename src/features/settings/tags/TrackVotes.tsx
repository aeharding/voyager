import { IonItem, IonToggle } from "@ionic/react";
import { setTagsTrackVotes } from "../settingsSlice";
import { useAppDispatch, useAppSelector } from "../../../store";

export default function TrackVotes() {
  const dispatch = useAppDispatch();
  const trackVotes = useAppSelector((state) => state.settings.tags.trackVotes);

  return (
    <IonItem>
      <IonToggle
        checked={trackVotes}
        onIonChange={(e) => dispatch(setTagsTrackVotes(e.detail.checked))}
      >
        Track Votes
      </IonToggle>
    </IonItem>
  );
}
