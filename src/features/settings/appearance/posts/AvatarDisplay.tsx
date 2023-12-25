import { setUserAvatarDisplay } from "../../settingsSlice";
import { OUserAvatarDisplayMode } from "../../../../services/db";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { IonToggle } from "@ionic/react";
import { InsetIonItem } from "../../shared/formatting";

export default function AvatarDisplay() {
  const dispatch = useAppDispatch();

  const userAvatarDisplay = useAppSelector(
    (state) => state.settings.appearance.general.userAvatarDisplay,
  );

  return (
    <InsetIonItem>
      <IonToggle
        checked={userAvatarDisplay === OUserAvatarDisplayMode.InComments}
        onIonChange={(e) =>
          dispatch(
            setUserAvatarDisplay(
              e.detail.checked
                ? OUserAvatarDisplayMode.InComments
                : OUserAvatarDisplayMode.Never,
            ),
          )
        }
      >
        Show avatars in comments
      </IonToggle>
    </InsetIonItem>
  );
}
