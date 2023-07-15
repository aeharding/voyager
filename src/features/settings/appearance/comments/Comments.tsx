import { IonLabel, IonList } from "@ionic/react";
import CollapsedByDefault, { ListHeader } from "./CollapsedByDefault";

export default function Comments() {
  return (
    <>
      <ListHeader>
        <IonLabel>Comments</IonLabel>
      </ListHeader>
      <IonList inset>
        <CollapsedByDefault />
      </IonList>
    </>
  );
}
