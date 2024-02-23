import { IonToggle } from "@ionic/react";
import { InsetIonItem } from "../../../../routes/pages/profile/ProfileFeedItemsPage";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { setMarkPostsReadOnScroll } from "../../settingsSlice";

export default function MarkReadOnScroll() {
  const dispatch = useAppDispatch();
  const { markReadOnScroll } = useAppSelector(
    (state) => state.settings.general.posts,
  );

  return (
    <InsetIonItem>
      <IonToggle
        checked={markReadOnScroll}
        onIonChange={(e) =>
          dispatch(setMarkPostsReadOnScroll(e.detail.checked))
        }
      >
        Mark Read on Scroll
      </IonToggle>
    </InsetIonItem>
  );
}
