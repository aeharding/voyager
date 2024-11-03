import { IonItem, IonToggle } from "@ionic/react";

import { useAppDispatch, useAppSelector } from "#/store";

import { setDisableAutoHideInCommunities } from "../../../settingsSlice";

export default function DisableInCommunities() {
  const dispatch = useAppDispatch();
  const disableAutoHideInCommunities = useAppSelector(
    (state) => state.settings.general.posts.disableAutoHideInCommunities,
  );

  return (
    <IonItem>
      <IonToggle
        checked={disableAutoHideInCommunities}
        onIonChange={(e) =>
          dispatch(setDisableAutoHideInCommunities(e.detail.checked))
        }
      >
        Disable in Communities
      </IonToggle>
    </IonItem>
  );
}
