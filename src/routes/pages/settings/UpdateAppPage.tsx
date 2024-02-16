import { styled } from "@linaria/react";
import {
  IonBackButton,
  IonBadge,
  IonButtons,
  IonContent,
  IonHeader,
  IonLabel,
  IonList,
  IonLoading,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { MaxWidthContainer } from "../../../features/shared/AppContent";
import { InsetIonItem, SettingLabel } from "../profile/ProfileFeedItemsPage";
import { useContext, useEffect, useRef, useState } from "react";
import { UpdateContext } from "./update/UpdateContext";
import { PageContentIonSpinner } from "../../../features/user/AsyncProfile";
import { useSetActivePage } from "../../../features/auth/AppContext";
import { ua } from "../../../helpers/device";
import { unloadServiceWorkerAndRefresh } from "../../../helpers/serviceWorker";

const UpToDateText = styled.div`
  margin: auto;
  text-align: center;

  padding: 5rem 1rem;

  color: var(--ion-color-medium);
`;

const Container = styled.div`
  height: 100%;
  width: 100%;

  display: flex;
  flex-direction: column;
`;

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
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/settings" text="Settings" />
          </IonButtons>

          <IonTitle>Updates</IonTitle>
        </IonToolbar>
      </IonHeader>
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
        <Container>
          <MaxWidthContainer>
            <IonList inset color="primary">
              <InsetIonItem>
                <IonLabel>Current version</IonLabel>
                <SettingLabel slot="end" color="medium">
                  {APP_VERSION}
                </SettingLabel>
              </InsetIonItem>
              <InsetIonItem
                href="https://github.com/aeharding/voyager/releases"
                target="_blank"
                rel="noopener noreferrer"
              >
                <IonLabel>Release notes</IonLabel>
              </InsetIonItem>
            </IonList>

            {status === "outdated" && (
              <IonList inset color="primary">
                <InsetIonItem detail onClick={onInstallUpdate}>
                  <IonLabel>Install new update</IonLabel>
                  <IonBadge color="danger">1</IonBadge>
                </InsetIonItem>
              </IonList>
            )}
          </MaxWidthContainer>

          {status === "loading" && <PageContentIonSpinner />}
          {status === "not-enabled" && (
            <UpToDateText>Not installed.</UpToDateText>
          )}
          {status === "error" && (
            <UpToDateText>
              Error checking for updates.
              <br />
              <br />
              Are you connected to the internet?
            </UpToDateText>
          )}
          {status === "current" && (
            <UpToDateText>Voyager is up to date</UpToDateText>
          )}
        </Container>
      </IonContent>
    </IonPage>
  );
}
