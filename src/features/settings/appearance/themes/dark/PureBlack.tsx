import { IonLabel, IonToggle } from "@ionic/react";
import { InsetIonItem } from "../../../../../pages/profile/ProfileFeedItemsPage";
import { useAppDispatch, useAppSelector } from "../../../../../store";
import { setPureBlack } from "../../../settingsSlice";

export default function PureBlack() {
  const dispatch = useAppDispatch();
  const { pureBlack } = useAppSelector(
    (state) => state.settings.appearance.dark
  );

  return (
    <InsetIonItem>
      <IonLabel>Pure Black Dark Mode</IonLabel>
      <IonToggle
        checked={pureBlack}
        onIonChange={(e) => dispatch(setPureBlack(e.detail.checked))}
      />
    </InsetIonItem>
  );
}
