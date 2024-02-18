import { IonToggle } from "@ionic/react";
import { InsetIonItem } from "../../../../routes/pages/profile/ProfileFeedItemsPage";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { setShowJumpButton } from "../../settingsSlice";

export default function ShowJumpButton() {
  const dispatch = useAppDispatch();
  const { showJumpButton } = useAppSelector(
    // this needs a better naming
    (state) => state.settings.general.comments,
  );

  return (
    <InsetIonItem>
      <IonToggle
        checked={showJumpButton}
        onIonChange={(e) => dispatch(setShowJumpButton(e.detail.checked))}
      >
        Show Jump Button
      </IonToggle>
    </InsetIonItem>
  );
}
