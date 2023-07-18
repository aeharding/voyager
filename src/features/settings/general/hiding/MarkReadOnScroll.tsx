import { IonLabel, IonToggle } from "@ionic/react";
import { InsetIonItem } from "../../../../pages/profile/ProfileFeedItemsPage";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { setMarkPostsReadOnScroll } from "../../settingsSlice";

export default function MarkReadOnScroll() {
  const dispatch = useAppDispatch();
  const { markReadOnScroll } = useAppSelector(
    (state) => state.settings.general.posts
  );

  return (
    <InsetIonItem>
      <IonLabel>Mark Read on Scroll</IonLabel>
      <IonToggle
        checked={markReadOnScroll}
        onIonChange={(e) =>
          dispatch(setMarkPostsReadOnScroll(e.detail.checked))
        }
      />
    </InsetIonItem>
  );
}
