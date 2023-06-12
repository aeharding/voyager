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

export default function Community() {
  const { actor, community } = useParams<{
    actor: string;
    community: string;
  }>();
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

          <IonTitle>{community}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <Posts communityName={community} />
      </IonContent>
    </IonPage>
  );
}
