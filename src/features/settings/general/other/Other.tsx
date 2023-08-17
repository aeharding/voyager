import { IonLabel, IonList } from "@ionic/react";
import { ListHeader } from "../../shared/formatting";
import Haptics from "./Haptics";
import ProfileTabLabel from "./ProfileTabLabel";
import LinkHandler from "./LinkHandler";

export default function Other() {
  return (
    <>
      <ListHeader>
        <IonLabel>Other</IonLabel>
      </ListHeader>
      <IonList inset>
        <LinkHandler />
        <ProfileTabLabel />
        <Haptics />
      </IonList>
    </>
  );
}
