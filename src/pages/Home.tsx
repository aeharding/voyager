import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import Posts from "../components/Posts";
import "./Tab1.css";
import { useParams } from "react-router";

export default function Home() {
  const { actor } = useParams<{ actor: string }>();
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton
              text="Communities"
              defaultHref={`/${actor}/communities`}
            />
          </IonButtons>

          <IonTitle>Home</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <Posts />
      </IonContent>
    </IonPage>
  );
}
