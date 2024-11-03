import { IonItem, IonToggle } from "@ionic/react";

import { useAppDispatch, useAppSelector } from "#/store";

import { setNoSubscribedInFeed } from "../../settingsSlice";

export default function NoSubscribedInFeed() {
  const dispatch = useAppDispatch();
  const noSubscribedInFeed = useAppSelector(
    (state) => state.settings.general.noSubscribedInFeed,
  );

  return (
    <IonItem>
      <IonToggle
        checked={noSubscribedInFeed}
        onIonChange={(e) => dispatch(setNoSubscribedInFeed(e.detail.checked))}
      >
        No Subscribed in All/Local
      </IonToggle>
    </IonItem>
  );
}
