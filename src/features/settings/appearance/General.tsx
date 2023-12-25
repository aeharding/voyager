import { IonLabel, IonList, IonToggle } from "@ionic/react";
import { InsetIonItem } from "../../../pages/profile/ProfileFeedItemsPage";
import { useAppDispatch, useAppSelector } from "../../../store";
import {
  setUserAvatarDisplay,
  setUserInstanceUrlDisplay,
} from "../settingsSlice";
import {
  OInstanceUrlDisplayMode,
  OUserAvatarDisplayMode,
} from "../../../services/db";
import { ListHeader } from "../shared/formatting";

export default function GeneralAppearance() {
  const dispatch = useAppDispatch();

  const userInstanceUrlDisplay = useAppSelector(
    (state) => state.settings.appearance.general.userInstanceUrlDisplay,
  );

  const userAvatarDisplay = useAppSelector(
    (state) => state.settings.appearance.general.userAvatarDisplay,
  );

  return (
    <>
      <ListHeader>
        <IonLabel>General</IonLabel>
      </ListHeader>
      <IonList inset>
        <InsetIonItem>
          <IonToggle
            checked={
              userInstanceUrlDisplay === OInstanceUrlDisplayMode.WhenRemote
            }
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
            Show user instance
          </IonToggle>
        </InsetIonItem>
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
            Show user avatars
          </IonToggle>
        </InsetIonItem>
      </IonList>
    </>
  );
}
