import { IonItem, IonToggle } from "@ionic/react";

import { useAppDispatch, useAppSelector } from "#/store";

import { setRememberPostAppearance } from "../../settingsSlice";

export default function RememberType() {
  const dispatch = useAppDispatch();
  const rememberType = useAppSelector(
    (state) => state.settings.appearance.posts.rememberType,
  );

  return (
    <IonItem>
      <IonToggle
        checked={rememberType}
        onIonChange={(e) =>
          dispatch(setRememberPostAppearance(e.detail.checked))
        }
      >
        Post Size Per Community
      </IonToggle>
    </IonItem>
  );
}
