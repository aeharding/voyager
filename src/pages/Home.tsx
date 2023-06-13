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
import { PageContext } from "../features/auth/PageContext";
import { useRef } from "react";

export default function Home() {
  const { actor } = useParams<{ actor: string }>();
  const pageRef = useRef<HTMLElement | undefined>();

  return (
    <IonPage ref={pageRef}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton text="Communities" defaultHref={`/${actor}`} />
          </IonButtons>

          <IonTitle>Home</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <PageContext.Provider value={{ page: pageRef.current }}>
          <Posts />
        </PageContext.Provider>
      </IonContent>
    </IonPage>
  );
}
