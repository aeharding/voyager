import { IonLabel, IonList } from "@ionic/react";
import { ListHeader } from "../comments/CollapsedByDefault";
import { InsetIonItem } from "../../../user/Profile";

export default function Posts() {
  return (
    <>
      <ListHeader>
        <IonLabel>Posts</IonLabel>
      </ListHeader>
      <IonList inset>
        <InsetIonItem routerLink="/settings/general/hiding">
          <IonLabel>Mark Read / Hiding Posts</IonLabel>
        </InsetIonItem>
      </IonList>
    </>
  );
}
