import { IonList, IonRadio, IonRadioGroup, IonToggle } from "@ionic/react";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { InsetIonItem } from "../../../user/Profile";
import {
  OProfileLabelType,
  setProfileLabel,
  setProfileHideInstanceUrl,
} from "../appearanceSlice";
import { jwtSelector } from "../../../../features/auth/authSlice";

export default function ProfileLabelSelection() {
  const dispatch = useAppDispatch();
  const jwt = useAppSelector(jwtSelector);
  const profileLabelType = useAppSelector(
    (state) => state.appearance.profile.label
  );
  const hideInstanceUrl = useAppSelector(
    (state) => state.appearance.profile.hideInstanceUrl
  );

  return (
    <>
      <IonRadioGroup
        value={profileLabelType}
        onIonChange={(e) => {
          dispatch(setProfileLabel(e.target.value));
        }}
      >
        <IonList inset>
          <InsetIonItem>
            <IonRadio value={OProfileLabelType.InstanceUrl}>
              Show instance URL
            </IonRadio>
          </InsetIonItem>
          <InsetIonItem>
            <IonRadio value={OProfileLabelType.Username} disabled={!jwt}>
              Show username
            </IonRadio>
          </InsetIonItem>
          <InsetIonItem>
            <IonRadio value={OProfileLabelType.Hide}>Hide</IonRadio>
          </InsetIonItem>
        </IonList>
      </IonRadioGroup>

      {profileLabelType === OProfileLabelType.Username && (
        <IonList inset>
          <InsetIonItem>
            <IonToggle
              checked={hideInstanceUrl}
              onIonChange={(e) =>
                dispatch(setProfileHideInstanceUrl(e.detail.checked))
              }
            >
              Hide instance url whenever possible
            </IonToggle>
          </InsetIonItem>
        </IonList>
      )}
    </>
  );
}
