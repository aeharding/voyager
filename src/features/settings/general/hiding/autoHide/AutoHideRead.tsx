import { IonToggle } from "@ionic/react";
import { InsetIonItem } from "../../../../../routes/pages/profile/ProfileFeedItemsPage";
import { useAppDispatch, useAppSelector } from "../../../../../store";
import { setAutoHideRead } from "../../../settingsSlice";

export default function AutoHideRead() {
  const dispatch = useAppDispatch();
  const autoHideRead = useAppSelector(
    (state) => state.settings.general.posts.autoHideRead,
  );

  return (
    <InsetIonItem>
      <IonToggle
        checked={autoHideRead}
        onIonChange={(e) => dispatch(setAutoHideRead(e.detail.checked))}
      >
        Auto Hide Read Posts
      </IonToggle>
    </InsetIonItem>
  );
}
