import { IonLabel } from "@ionic/react";
import { InsetIonItem } from "../../user/Profile";
import { useAppSelector } from "../../../store";

export default function ProfileLabel() {
  const profileLabelType = useAppSelector(
    (state) => state.appearance.profile.label
  );

  return (
    <InsetIonItem routerLink="/settings/appearance/profile-label">
      <IonLabel>Choose navbar profile label</IonLabel>

      <IonLabel
        slot="end"
        color="medium"
        style={{ textTransform: "capitalize" }}
      >
        {profileLabelType.replace("_", " ")}
      </IonLabel>
    </InsetIonItem>
  );
}
