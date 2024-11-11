import { IonLabel, IonList } from "@ionic/react";

import { ListHeader } from "#/features/settings/shared/formatting";

import DisplayVotes from "./DisplayVotes";
import ShowUserInstance from "./ShowUserInstance";

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
