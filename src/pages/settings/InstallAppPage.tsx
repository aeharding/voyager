import {
  IonBackButton,
  IonButton,
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
  download,
  shareOutline,
} from "ionicons/icons";
import AppContent from "../../features/shared/AppContent";
import styled from "@emotion/styled";
import { isInstallable, isInstalled, ua } from "../../helpers/device";
import { useContext } from "react";
import { BeforeInstallPromptContext } from "../../BeforeInstallPromptProvider";
import { css } from "@emotion/react";

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
  const beforeInstallPrompt = useContext(BeforeInstallPromptContext);

  function renderGuidance() {
    const why = (
      <>
        <h3>Why</h3>
        <ol>
          <li>Easy access from your home screen</li>
          <li>Less Jank — Better page transitions and gestures</li>
          <li>Push notifications and badging — coming soon!</li>
        </ol>
      </>
    );

    if (isInstalled()) {
      return (
        <>
          <h3>
            <IonIcon icon={checkmarkCircleOutline} color="success" /> App
            Installed
          </h3>
          <IonText color="medium">
            <p>Congrats, you&apos;re browsing from the app!</p>
          </IonText>
        </>
      );
    }

    if (beforeInstallPrompt.event) {
      return (
        <>
          <h3>How to get the App</h3>

          <p>
            <IonButton
              color="primary"
              onClick={async () => {
                try {
                  await beforeInstallPrompt.event?.prompt();
                } finally {
                  beforeInstallPrompt.clearEvent();
                }
              }}
            >
              <IonIcon
                icon={download}
                css={css`
                  margin-right: 0.65rem;
                `}
              />{" "}
              Install App
            </IonButton>
          </p>

          {why}
        </>
      );
    }

    if (ua.getDevice().vendor === "Apple" && navigator.maxTouchPoints > 1) {
      return (
        <>
          <h3>How to get the App</h3>
          <ol>
            <li>
              Tap <IonIcon icon={shareOutline} color="primary" /> from the
              Safari tab bar
            </li>
            <li>
              Scroll and tap Add to Home Screen <IonIcon icon={addOutline} />
            </li>
          </ol>

          {why}
        </>
      );
    }

    if (isInstallable) {
      return (
        <>
          <h3>How to get the App</h3>
          <ol>
            <li>
              You may have the app already installed. Check your homescreen!
            </li>
            <li>
              If not, check for an &quot;install app&quot; button in your
              browser&apos;s controls
            </li>
          </ol>

          {why}
        </>
      );
    }

    return (
      <>
        <h3>How to get the App</h3>
        <ol>
          <li>
            Install the app by visiting{" "}
            <span
              css={css`
                text-decoration: underline;
              `}
            >
              https://vger.app/settings/install
            </span>{" "}
            from your phone or tablet.
          </li>
        </ol>

        {why}
      </>
    );
  }

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
      <AppContent scrollY>
        <Container className="ion-padding">
          <AppContainer>
            <img src="/logo.png" alt="" />
            <div>
              Voyager<aside>by Alexander Harding</aside>
            </div>
          </AppContainer>

          {renderGuidance()}
        </Container>
      </AppContent>
    </IonPage>
  );
}
