import { IonLabel, IonList } from "@ionic/react";
import CollapsedByDefault from "../../general/comments/CollapsedByDefault";
import DefaultSort from "./DefaultSort";
import { ListHeader } from "../../shared/formatting";

export default function Comments() {
  return (
    <>
      <ListHeader>
        <IonLabel>Comments</IonLabel>
      </ListHeader>
      <IonList inset>
        <CollapsedByDefault />
        <DefaultSort />
      </IonList>
    </>
  );
}
