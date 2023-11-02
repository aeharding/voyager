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
  chevronBack,
  shareOutline,
} from "ionicons/icons";
import AppContent from "../../features/shared/AppContent";
import styled from "@emotion/styled";
import {
  isAndroid,
  isAppleDeviceInstallable,
  isInstallable,
  isInstalled,
  ua,
} from "../../helpers/device";
import { useContext, useRef, useState } from "react";
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

  a {
    display: flex;
  }

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

const H3 = styled.h3`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ANDROID_APP_BADGES = [
  {
    src: "/public/badges/play.svg",
    href: "https://play.google.com/store/apps/details?id=app.vger.voyager",
  },
  {
    src: "/public/badges/fdroid.png",
    href: "https://f-droid.org/en/packages/app.vger.voyager/",
  },
];

const IOS_APP_BADGES = [
  {
    src: "/public/badges/ios.svg",
    href: "https://apps.apple.com/us/app/voyager-for-lemmy/id6451429762",
  },
];

export default function InstallAppPage() {
  const pageRef = useRef<HTMLElement>(null);
  const [showInstallwebAppDirections, setShowInstallwebAppDirections] =
    useState(false);

  useSetActivePage(pageRef);

  const beforeInstallPrompt = useContext(BeforeInstallPromptContext);

  const relevantBadges = (() => {
    if (isAppleDeviceInstallable()) return IOS_APP_BADGES;
    if (isAndroid()) return ANDROID_APP_BADGES;

    return [...IOS_APP_BADGES, ...ANDROID_APP_BADGES];
  })();

  const nativeBadges = (
    <>
      {relevantBadges.map(({ src, href }) => (
        <BadgeItem key={src}>
          <a href={href} target="_blank" rel="noopener noreferrer">
            <BadgeImg src={src} />
          </a>
        </BadgeItem>
      ))}
    </>
  );

  const howToGetAppTitle = (
    <H3>
      {showInstallwebAppDirections && (
        <IonIcon
          icon={chevronBack}
          onClick={() => setShowInstallwebAppDirections(false)}
        />
      )}{" "}
      How to get the App
    </H3>
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
            if (!beforeInstallPrompt.event) {
              setShowInstallwebAppDirections(true);
              return;
            }

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

    if (beforeInstallPrompt.event) {
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
          {howToGetAppTitle}

          {showInstallwebAppDirections ? (
            <ol>
              <li>
                Tap <IonIcon icon={shareOutline} color="primary" /> from the
                Safari tab bar
              </li>
              <li>
                Scroll and tap Add to Home Screen <IonIcon icon={addOutline} />
              </li>
            </ol>
          ) : (
            badgesWithWeb
          )}

          {why}
        </>
      );
    }

    if (isInstallable) {
      return (
        <>
          {howToGetAppTitle}

          {showInstallwebAppDirections ? (
            <ol>
              <li>
                You may have the app already installed. Check your homescreen!
              </li>
              <li>
                If not, check for an &quot;install app&quot; button in your
                browser&apos;s controls
              </li>
            </ol>
          ) : (
            badgesWithWeb
          )}

          {why}
        </>
      );
    }

    return (
      <>
        {howToGetAppTitle}

        {showInstallwebAppDirections ? (
          <ol>
            <li>
              Visit{" "}
              <span
                css={css`
                  text-decoration: underline;
                `}
              >
                https://vger.app/settings/install
              </span>{" "}
              from your phone or tablet.
            </li>
            <li>Tap &quot;Launch as Web App&quot;</li>
          </ol>
        ) : (
          badgesWithWeb
        )}

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
              Voyager for Lemmy<aside>by Alexander Harding</aside>
            </div>
          </AppContainer>

          {renderGuidance()}
        </Container>
      </AppContent>
    </IonPage>
  );
}
