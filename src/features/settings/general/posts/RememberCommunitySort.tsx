import { IonToggle } from "@ionic/react";
import { InsetIonItem } from "../../../../routes/pages/profile/ProfileFeedItemsPage";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { setRememberCommunitySort } from "../../settingsSlice";

export default function RememberCommunitySort() {
  const dispatch = useAppDispatch();
  const infiniteScrolling = useAppSelector(
    (state) => state.settings.general.posts.rememberCommunitySort,
  );

  return (
    <InsetIonItem>
      <IonToggle
        checked={infiniteScrolling}
        onIonChange={(e) =>
          dispatch(setRememberCommunitySort(e.detail.checked))
        }
      >
        Remember Community Sort
      </IonToggle>
    </InsetIonItem>
  );
}
