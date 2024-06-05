import { useCallback, useEffect, useRef, useState } from "react";
import AppHeader from "../../../features/shared/AppHeader";
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import useGetRandomCommunity from "../../../features/community/useGetRandomCommunity";
import { FailedMessage } from "../../../features/user/AsyncProfile";
import { CenteredSpinner } from "../../../features/shared/CenteredSpinner";

export default function RandomCommunityPage() {
  const pushed = useRef(false);
  const getRandomCommunity = useGetRandomCommunity();
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      await getRandomCommunity();
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }, [getRandomCommunity]);

  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;

    load();
  }, [load]);

  function renderContent() {
    if (loading) return <CenteredSpinner />;

    return (
      <>
        <IonRefresher
          slot="fixed"
          onIonRefresh={async (e) => {
            try {
              await load();
            } finally {
              e.detail.complete();
            }
          }}
        >
          <IonRefresherContent />
        </IonRefresher>
        <FailedMessage>Failed to load :(</FailedMessage>
      </>
    );
  }

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
      <IonContent>{renderContent()}</IonContent>
    </IonPage>
  );
}
