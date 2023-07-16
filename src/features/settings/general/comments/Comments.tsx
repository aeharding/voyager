import { IonLabel, IonList } from "@ionic/react";
import CollapsedByDefault, {
  ListHeader,
} from "../../general/comments/CollapsedByDefault";
import DefaultSort from "./DefaultSort";

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
