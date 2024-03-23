import { IonLabel, IonList } from "@ionic/react";
import { ListHeader } from "../../shared/formatting";
import ShowUserInstance from "./ShowUserInstance";
import DisplayVotes from "./DisplayVotes";

export default function Other() {
  return (
    <>
      <ListHeader>
        <IonLabel>Other</IonLabel>
      </ListHeader>
      <IonList inset>
        <DisplayVotes />
        <ShowUserInstance />
      </IonList>
    </>
  );
}
