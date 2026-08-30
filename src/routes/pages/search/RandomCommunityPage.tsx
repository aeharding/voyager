import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToolbar,
  useIonViewDidEnter,
} from "@ionic/react";
import { useCallback, useEffect, useRef, useState } from "react";

import useGetRandomCommunity from "#/features/community/useGetRandomCommunity";
import AppHeader from "#/features/shared/AppHeader";
import { CenteredSpinner } from "#/features/shared/CenteredSpinner";
import { AppPage } from "#/helpers/AppPage";

import sharedStyles from "#/features/shared/shared.module.css";

export default function RandomCommunityPage() {
  const pushed = useRef(false);
  const getRandomCommunity = useGetRandomCommunity();
  const [loading, setLoading] = useState(true);
  const [viewEntered] = useState(() => {
    let resolve!: () => void;
    const promise = new Promise<void>((done) => {
      resolve = done;
    });

    return { promise, resolve };
  });

  useIonViewDidEnter(viewEntered.resolve);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      await getRandomCommunity(viewEntered.promise);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }, [getRandomCommunity, viewEntered]);

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
        <div className={sharedStyles.pageFailedMessage}>Failed to load :(</div>
      </>
    );
  }

  return (
    <AppPage>
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>Random</IonTitle>
        </IonToolbar>
      </AppHeader>
      <IonContent>{renderContent()}</IonContent>
    </AppPage>
  );
}
