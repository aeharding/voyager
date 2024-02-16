import { IonToggle } from "@ionic/react";
import { InsetIonItem } from "../../../../routes/pages/profile/ProfileFeedItemsPage";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { setInfiniteScrolling } from "../../settingsSlice";

export default function InfiniteScrolling() {
  const dispatch = useAppDispatch();
  const infiniteScrolling = useAppSelector(
    (state) => state.settings.general.posts.infiniteScrolling,
  );

  return (
    <InsetIonItem>
      <IonToggle
        checked={infiniteScrolling}
        onIonChange={(e) => dispatch(setInfiniteScrolling(e.detail.checked))}
      >
        Infinite Scrolling
      </IonToggle>
    </InsetIonItem>
  );
}
