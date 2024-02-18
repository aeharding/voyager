import { IonToggle } from "@ionic/react";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { setUserInstanceUrlDisplay } from "../../settingsSlice";
import { OInstanceUrlDisplayMode } from "../../../../services/db";
import { InsetIonItem } from "../../shared/formatting";

export default function ShowUserInstance() {
  const dispatch = useAppDispatch();
  const userInstanceUrlDisplay = useAppSelector(
    (state) => state.settings.appearance.general.userInstanceUrlDisplay,
  );

  return (
    <InsetIonItem>
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
    </InsetIonItem>
  );
}
