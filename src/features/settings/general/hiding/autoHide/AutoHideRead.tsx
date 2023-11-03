import { IonLabel, IonToggle } from "@ionic/react";
import { InsetIonItem } from "../../../../../pages/profile/ProfileFeedItemsPage";
import { useAppDispatch, useAppSelector } from "../../../../../store";
import { setAutoHideRead } from "../../../settingsSlice";

export default function AutoHideRead() {
  const dispatch = useAppDispatch();
  const autoHideRead = useAppSelector(
    (state) => state.settings.general.posts.autoHideRead,
  );

  return (
    <InsetIonItem>
      <IonLabel>Auto Hide Read Posts</IonLabel>
      <IonToggle
        checked={autoHideRead}
        onIonChange={(e) => dispatch(setAutoHideRead(e.detail.checked))}
      />
    </InsetIonItem>
  );
}
