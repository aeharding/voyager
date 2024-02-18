import { IonToggle } from "@ionic/react";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { InsetIonItem } from "../../shared/formatting";
import { setShowCommunityIcons } from "../../settingsSlice";

export default function ShowCommunityIcons() {
  const dispatch = useAppDispatch();
  const showCommunityIcons = useAppSelector(
    (state) => state.settings.appearance.posts.showCommunityIcons,
  );

  return (
    <InsetIonItem>
      <IonToggle
        checked={showCommunityIcons}
        onIonChange={(e) => dispatch(setShowCommunityIcons(e.detail.checked))}
      >
        Show Community Icons
      </IonToggle>
    </InsetIonItem>
  );
}
