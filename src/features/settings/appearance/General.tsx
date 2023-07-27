import { IonLabel, IonList, IonToggle } from "@ionic/react";
import { InsetIonItem } from "../../../pages/profile/ProfileFeedItemsPage";
import { useAppDispatch, useAppSelector } from "../../../store";
import { setProfileLabel, setUserInstanceUrlDisplay } from "../settingsSlice";
import {
  OInstanceUrlDisplayMode,
  OProfileLabelType,
  ProfileLabelType,
} from "../../../services/db";
import { ListHeader } from "../shared/formatting";
import SettingSelector from "../shared/SettingSelector";

export default function GeneralAppearance() {
  const dispatch = useAppDispatch();

  const userInstanceUrlDisplay = useAppSelector(
    (state) => state.settings.appearance.general.userInstanceUrlDisplay
  );
  const profileLabel = useAppSelector(
    (state) => state.settings.appearance.general.profileLabel
  );

  const ProfileLabelSelector = SettingSelector<ProfileLabelType>;

  return (
    <>
      <ListHeader>
        <IonLabel>General</IonLabel>
      </ListHeader>
      <IonList inset>
        <InsetIonItem>
          <IonLabel>Show user instance</IonLabel>
          <IonToggle
            checked={
              userInstanceUrlDisplay === OInstanceUrlDisplayMode.WhenRemote
            }
            onIonChange={(e) =>
              dispatch(
                setUserInstanceUrlDisplay(
                  e.detail.checked
                    ? OInstanceUrlDisplayMode.WhenRemote
                    : OInstanceUrlDisplayMode.Never
                )
              )
            }
          />
        </InsetIonItem>
        <ProfileLabelSelector
          title="Profile Button Label"
          selected={profileLabel}
          setSelected={setProfileLabel}
          options={OProfileLabelType}
        />
      </IonList>
    </>
  );
}
