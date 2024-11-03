import { IonItem, IonToggle } from "@ionic/react";

import { useAppDispatch, useAppSelector } from "#/store";

import { setShowHiddenInCommunities } from "../../settingsSlice";

export default function ShowHiddenInCommunities() {
  const dispatch = useAppDispatch();
  const showHiddenInCommunities = useAppSelector(
    (state) => state.settings.general.posts.showHiddenInCommunities,
  );

  return (
    <IonItem>
      <IonToggle
        checked={showHiddenInCommunities}
        onIonChange={(e) =>
          dispatch(setShowHiddenInCommunities(e.detail.checked))
        }
      >
        Show Hidden in Communities
      </IonToggle>
    </IonItem>
  );
}
