import { IonItem, IonLabel } from "@ionic/react";

export default function Browse() {
  return (
    <>
      <IonItem button routerLink="/settings/tags/browse?filter=all" detail>
        <IonLabel>View All</IonLabel>
      </IonItem>
      <IonItem button routerLink="/settings/tags/browse?filter=tagged" detail>
        <IonLabel>View Tagged</IonLabel>
      </IonItem>
    </>
  );
}
