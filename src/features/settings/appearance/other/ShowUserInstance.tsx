import { IonItem, IonToggle } from "@ionic/react";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { setUserInstanceUrlDisplay } from "../../settingsSlice";
import { OInstanceUrlDisplayMode } from "../../../../services/db";

export default function ShowUserInstance() {
  const dispatch = useAppDispatch();
  const userInstanceUrlDisplay = useAppSelector(
    (state) => state.settings.appearance.general.userInstanceUrlDisplay,
  );

  return (
    <IonItem>
      <IonToggle
        checked={userInstanceUrlDisplay === OInstanceUrlDisplayMode.WhenRemote}
        onIonChange={(e) =>
          dispatch(
            setUserInstanceUrlDisplay(
              e.detail.checked
                ? OInstanceUrlDisplayMode.WhenRemote
                : OInstanceUrlDisplayMode.Never,
            ),
          )
        }
      >
        Show User Instance
      </IonToggle>
    </IonItem>
  );
}
