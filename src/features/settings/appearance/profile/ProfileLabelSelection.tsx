import { IonList, IonRadio, IonRadioGroup } from "@ionic/react";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { InsetIonItem } from "../../../user/Profile";
import { OProfileLabelType, setProfileLabel } from "../appearanceSlice";

export default function ProfileLabelSelection() {
  const dispatch = useAppDispatch();
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
          <IonRadio value={OProfileLabelType.Username}>Show username</IonRadio>
        </InsetIonItem>
        <InsetIonItem>
          <IonRadio value={OProfileLabelType.Hide}>Hide</IonRadio>
        </InsetIonItem>
      </IonList>
    </IonRadioGroup>
  );
}
