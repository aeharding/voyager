import { IonLabel, IonToggle } from "@ionic/react";
import { InsetIonItem } from "../../../../../pages/profile/ProfileFeedItemsPage";
import { useAppDispatch, useAppSelector } from "../../../../../store";
import { setDisableAutoHideInCommunities } from "../../../settingsSlice";

export default function DisableInCommunities() {
  const dispatch = useAppDispatch();
  const disableAutoHideInCommunities = useAppSelector(
    (state) => state.settings.general.posts.disableAutoHideInCommunities,
  );

  return (
    <InsetIonItem>
      <IonLabel>Disable in Communities</IonLabel>
      <IonToggle
        checked={disableAutoHideInCommunities}
        onIonChange={(e) =>
          dispatch(setDisableAutoHideInCommunities(e.detail.checked))
        }
      />
    </InsetIonItem>
  );
}
