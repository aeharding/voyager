import { IonLabel, IonToggle } from "@ionic/react";
import { InsetIonItem } from "../../../../pages/profile/ProfileFeedItemsPage";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { setInfiniteScrolling } from "../../settingsSlice";

export default function InfiniteScrolling() {
  const dispatch = useAppDispatch();
  const infiniteScrolling = useAppSelector(
    (state) => state.settings.general.posts.infiniteScrolling,
  );

  return (
    <InsetIonItem>
      <IonLabel>Infinite Scrolling</IonLabel>
      <IonToggle
        checked={infiniteScrolling}
        onIonChange={(e) => dispatch(setInfiniteScrolling(e.detail.checked))}
      />
    </InsetIonItem>
  );
}
