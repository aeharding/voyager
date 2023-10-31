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
import { useContext, useRef } from "react";
import { BeforeInstallPromptContext } from "../../BeforeInstallPromptProvider";
import { css } from "@emotion/react";
import { useSetActivePage } from "../../features/auth/AppContext";

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

const BadgeContainer = styled.div`
  display: grid;
  grid-template-rows: 50px;
  grid-template-columns: 1fr 1fr;
  gap: 20px 0;
  height: auto;

  @media (max-width: 360px) {
    grid-template-columns: 1fr;
    gap: 20px 0;
  }

  @media (min-width: 800px) {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
`;

const BadgeItem = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const BadgeImg = styled.img`
  height: 45px;
`;

export default function InstallAppPage() {
  const pageRef = useRef<HTMLElement>(null);

  useSetActivePage(pageRef);

  const beforeInstallPrompt = useContext(BeforeInstallPromptContext);

  const nativeBadges = (
    <>
      <BadgeItem>
        <BadgeImg src="/public/badges/ios.svg" alt="" />
      </BadgeItem>
      <BadgeItem>
        <BadgeImg src="/public/badges/play.svg" alt="" />
      </BadgeItem>
      <BadgeItem>
        <BadgeImg src="/public/badges/fdroid.png" alt="" />
      </BadgeItem>
    </>
  );

  const badges = <BadgeContainer>{nativeBadges}</BadgeContainer>;
  const badgesWithWeb = (
    <BadgeContainer>
      {nativeBadges}
      <BadgeItem>
        <BadgeImg
          src="/public/badges/pwa.svg"
          alt=""
          onClick={async () => {
            try {
              await beforeInstallPrompt.event?.prompt();
            } finally {
              beforeInstallPrompt.clearEvent();
            }
          }}
        />
      </BadgeItem>
    </BadgeContainer>
  );

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
            <p>Congrats, you&apos;re browsing from the webapp!</p>
            <p>You can also install the native app for a richer experience.</p>
          </IonText>
          {badges}
        </>
      );
    }

    if (beforeInstallPrompt.event || true) {
      return (
        <>
          <h3>How to get the App</h3>

          {badgesWithWeb}

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
    <IonPage ref={pageRef} className="grey-bg">
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
