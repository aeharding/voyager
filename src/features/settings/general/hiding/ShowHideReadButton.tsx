import { IonLabel, IonToggle } from "@ionic/react";
import { InsetIonItem } from "../../../../pages/profile/ProfileFeedItemsPage";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { setShowHideReadButton } from "../../settingsSlice";

export default function ShowHideReadButton() {
  const dispatch = useAppDispatch();
  const { showHideReadButton } = useAppSelector(
    (state) => state.settings.general.posts
  );

  return (
    <InsetIonItem>
      <IonLabel>Show Hide Read Button</IonLabel>
      <IonToggle
        checked={showHideReadButton}
        onIonChange={(e) => dispatch(setShowHideReadButton(e.detail.checked))}
      />
    </InsetIonItem>
  );
}
