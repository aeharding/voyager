import { IonItem, IonLabel } from "@ionic/react";

export default function Browse() {
  return (
    <>
      <IonItem button routerLink="/settings/tags/browse?filter=all">
        <IonLabel>View All</IonLabel>
      </IonItem>
      <IonItem button routerLink="/settings/tags/browse?filter=tagged">
        <IonLabel>View Tagged</IonLabel>
      </IonItem>
    </>
  );
}
