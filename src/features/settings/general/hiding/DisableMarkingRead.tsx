import { IonToggle } from "@ionic/react";
import { InsetIonItem } from "../../../../pages/profile/ProfileFeedItemsPage";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { setDisableMarkingPostsRead } from "../../settingsSlice";

export default function DisableMarkingRead() {
  const dispatch = useAppDispatch();
  const { disableMarkingRead } = useAppSelector(
    (state) => state.settings.general.posts,
  );

  return (
    <InsetIonItem>
      <IonToggle
        checked={disableMarkingRead}
        onIonChange={(e) =>
          dispatch(setDisableMarkingPostsRead(e.detail.checked))
        }
      >
        Disable Marking Posts Read
      </IonToggle>
    </InsetIonItem>
  );
}
