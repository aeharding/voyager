import { IonLabel, IonList } from "@ionic/react";
import { ListHeader } from "../../shared/formatting";
import ProfileTabLabel from "./ProfileTabLabel";

export default function Other() {
  return (
    <>
      <ListHeader>
        <IonLabel>Other</IonLabel>
      </ListHeader>
      <IonList inset>
        <ProfileTabLabel />
      </IonList>
    </>
  );
}
