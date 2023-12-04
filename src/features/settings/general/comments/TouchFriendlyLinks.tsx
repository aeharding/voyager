import { IonToggle } from "@ionic/react";
import { InsetIonItem } from "../../../../pages/profile/ProfileFeedItemsPage";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { setTouchFriendlyLinks } from "../../settingsSlice";

export default function TouchFriendlyLinks() {
  const dispatch = useAppDispatch();
  const { touchFriendlyLinks } = useAppSelector(
    // this needs a better naming
    (state) => state.settings.general.comments,
  );

  return (
    <InsetIonItem>
      <IonToggle
        checked={touchFriendlyLinks}
        onIonChange={(e) => dispatch(setTouchFriendlyLinks(e.detail.checked))}
      >
        Touch Friendly Links
      </IonToggle>
    </InsetIonItem>
  );
}
