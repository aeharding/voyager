import {
  IonHeader,
  IonItem,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import AppContent from "../components/AppContent";
import { useParams } from "react-router";

export default function Communities() {
  const { actor } = useParams<{ actor: string }>();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Communities</IonTitle>
        </IonToolbar>
      </IonHeader>
      <AppContent>
        <IonList>
          <IonItem routerLink={`/${actor}/home`}>Home</IonItem>
        </IonList>
      </AppContent>
    </IonPage>
  );
}
