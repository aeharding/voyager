import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonIcon,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import {
  addOutline,
  checkmarkCircleOutline,
  shareOutline,
} from "ionicons/icons";
import AppContent from "../../features/shared/AppContent";
import styled from "@emotion/styled";
import { isInstalled } from "../../helpers/device";

const Container = styled.div`
  line-height: 1.5;
`;

const AppContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.2rem;
  margin: 2rem 0 3rem;

  img {
    width: 70px;
    height: 70px;
    border-radius: 1rem;
  }

  aside {
    font-size: 0.9rem;
    margin-top: 0.25rem;
    color: var(--ion-color-medium);
  }
`;

export default function InstallAppPage() {
  return (
    <IonPage className="grey-bg">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/settings" text="Settings" />
          </IonButtons>

          <IonTitle>Install</IonTitle>
        </IonToolbar>
      </IonHeader>
      <AppContent>
        <Container className="ion-padding">
          <AppContainer>
            <img src="/logo.jpg" alt="" />
            <div>
              wefwef<aside>by Alexander Harding</aside>
            </div>
          </AppContainer>

          {!isInstalled() ? (
            <>
              <h3>How to get the App</h3>
              <ol>
                <li>
                  Tap <IonIcon icon={shareOutline} color="primary" /> from the
                  Safari tab bar
                </li>
                <li>
                  Scroll and tap Add to Home Screen{" "}
                  <IonIcon icon={addOutline} />
                </li>
              </ol>

              <h3>Why</h3>
              <ol>
                <li>Easy access from your home screen</li>
                <li>Less Jank — Better page transitions and gestures</li>
                <li>Push notifications and badging — coming soon!</li>
              </ol>
            </>
          ) : (
            <>
              <h3>
                <IonIcon icon={checkmarkCircleOutline} color="success" /> App
                Installed
              </h3>
              <IonText color="medium">
                <p>Congrats, you&apos;re browsing from the app!</p>
              </IonText>
            </>
          )}
        </Container>
      </AppContent>
    </IonPage>
  );
}
