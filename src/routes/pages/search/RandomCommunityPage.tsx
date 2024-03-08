import { useEffect, useRef } from "react";
import AppHeader from "../../../features/shared/AppHeader";
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import useGetRandomCommunity from "../../../features/community/useGetRandomCommunity";

export default function RandomCommunityPage() {
  const pushed = useRef(false);
  const getRandomCommunity = useGetRandomCommunity();

  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;

    getRandomCommunity();
  }, [getRandomCommunity]);

  return (
    <IonPage>
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>Random</IonTitle>
        </IonToolbar>
      </AppHeader>
      <IonContent />
    </IonPage>
  );
}
