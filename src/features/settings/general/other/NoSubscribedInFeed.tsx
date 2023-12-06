import { IonToggle } from "@ionic/react";
import { InsetIonItem } from "../../../../pages/profile/ProfileFeedItemsPage";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { setNoSubscribedInFeed } from "../../settingsSlice";

export default function NoSubscribedInFeed() {
  const dispatch = useAppDispatch();
  const noSubscribedInFeed = useAppSelector(
    (state) => state.settings.general.noSubscribedInFeed,
  );

  return (
    <InsetIonItem>
      <IonToggle
        checked={noSubscribedInFeed}
        onIonChange={(e) => dispatch(setNoSubscribedInFeed(e.detail.checked))}
      >
        No Subscribed in All/Local
      </IonToggle>
    </InsetIonItem>
  );
}
