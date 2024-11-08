import { IonItem, IonToggle, useIonAlert } from "@ionic/react";

import { OInstanceUrlDisplayMode } from "#/services/db";

import { useAppDispatch, useAppSelector } from "../../../store";
import { setTagsHideInstance } from "../settingsSlice";

export default function HideInstance() {
  const dispatch = useAppDispatch();
  const [presentAlert] = useIonAlert();
  const hideInstance = useAppSelector(
    (state) => state.settings.tags.hideInstance,
  );
  const userInstanceUrlDisplay = useAppSelector(
    (state) => state.settings.appearance.general.userInstanceUrlDisplay,
  );

  return (
    <IonItem>
      <IonToggle
        checked={hideInstance}
        onIonChange={(e) => {
          if (userInstanceUrlDisplay === OInstanceUrlDisplayMode.Never) {
            presentAlert({
              header: "Just FYI...",
              message:
                "This setting has no effect unless you enable “Show User Instance” in Settings > Appearance > Other.",
              buttons: ["OK"],
            });
          }

          dispatch(setTagsHideInstance(e.detail.checked));
        }}
      >
        Hide Instance When Tagged
      </IonToggle>
    </IonItem>
  );
}
