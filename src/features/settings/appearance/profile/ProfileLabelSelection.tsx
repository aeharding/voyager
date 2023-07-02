import { IonList, IonRadio, IonRadioGroup } from "@ionic/react";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { InsetIonItem } from "../../../user/Profile";
import { OProfileLabelType, setProfileLabel } from "../appearanceSlice";
import { jwtSelector } from "../../../../features/auth/authSlice";

export default function ProfileLabelSelection() {
  const dispatch = useAppDispatch();
  const jwt = useAppSelector(jwtSelector);
  const profileLabelType = useAppSelector(
    (state) => state.appearance.profile.label
  );

  return (
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
  );
}
