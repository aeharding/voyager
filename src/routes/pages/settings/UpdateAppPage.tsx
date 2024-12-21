import {
  IonBackButton,
  IonBadge,
  IonButtons,
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonLoading,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useContext, useEffect, useRef, useState } from "react";

import { useSetActivePage } from "#/features/auth/AppContext";
import { MaxWidthContainer } from "#/features/shared/AppContent";
import AppHeader from "#/features/shared/AppHeader";
import { ua } from "#/helpers/device";
import { unloadServiceWorkerAndRefresh } from "#/helpers/serviceWorker";

import AppVersionInfo from "./about/AppVersionInfo";
import { UpdateContext } from "./update/UpdateContext";

import sharedStyles from "#/features/shared/shared.module.css";
import styles from "./UpdateAppPage.module.css";

export default function UpdateAppPage() {
  const pageRef = useRef<HTMLElement>(null);

  const [loading, setLoading] = useState(false);
  const { status, checkForUpdates, updateServiceWorker } =
    useContext(UpdateContext);

  useSetActivePage(pageRef);

  useEffect(() => {
    checkForUpdates();
  }, [checkForUpdates]);

  async function onInstallUpdate() {
    setLoading(true);

    try {
      if (ua.getEngine().name === "WebKit") {
        // There is a Safari bug where it won't update the service worker if the SSL certificate has renewed
        // So instead of gracefully updating, just nuke the service worker and start over
        // See: https://github.com/aeharding/voyager/issues/896

        await unloadServiceWorkerAndRefresh();
      } else {
        await updateServiceWorker();
      }
    } finally {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Sometimes updateServiceWorker() doesn't refresh in Safari,
      // even though the page needs refresh?!
      location.reload();
    }
  }

  return (
    <IonPage ref={pageRef} className="grey-bg">
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/settings" text="Settings" />
          </IonButtons>

          <IonTitle>Updates</IonTitle>
        </IonToolbar>
      </AppHeader>
      <IonContent>
        <IonLoading isOpen={loading} message="Updating" />
        <IonRefresher
          slot="fixed"
          onIonRefresh={async (e) => {
            try {
              await checkForUpdates();
            } finally {
              e.detail.complete();
            }
          }}
        >
          <IonRefresherContent />
        </IonRefresher>
        <div className={styles.container}>
          <MaxWidthContainer>
            <IonList inset color="primary">
              <IonItem>
                <IonLabel>Current version</IonLabel>
                <IonLabel slot="end" color="medium">
                  <AppVersionInfo />
                </IonLabel>
              </IonItem>
              <IonItem
                href="https://github.com/aeharding/voyager/releases"
                target="_blank"
                rel="noopener noreferrer"
              >
                <IonLabel>Release notes</IonLabel>
              </IonItem>
            </IonList>

            {status === "outdated" && (
              <IonList inset color="primary">
                <IonItem detail onClick={onInstallUpdate}>
                  <IonLabel>Install new update</IonLabel>
                  <IonBadge color="danger">1</IonBadge>
                </IonItem>
              </IonList>
            )}
          </MaxWidthContainer>

          {status === "loading" && (
            <IonSpinner className={sharedStyles.pageSpinner} />
          )}
          {status === "not-enabled" && (
            <div className={styles.upToDateText}>Not installed.</div>
          )}
          {status === "error" && (
            <div className={styles.upToDateText}>
              Error checking for updates.
              <br />
              <br />
              Are you connected to the internet?
            </div>
          )}
          {status === "current" && (
            <div className={styles.upToDateText}>Voyager is up to date</div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}
