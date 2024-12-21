import {
  IonBackButton,
  IonButtons,
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
} from "ionicons/icons";
import { useContext, useRef, useState } from "react";

import { useSetActivePage } from "#/features/auth/AppContext";
import { BeforeInstallPromptContext } from "#/features/pwa/BeforeInstallPromptProvider";
import AppContent from "#/features/shared/AppContent";
import AppHeader from "#/features/shared/AppHeader";
import {
  getShareIcon,
  isAndroid,
  isAppleDeviceInstallable,
  isInstallable,
  isInstalled,
  ua,
} from "#/helpers/device";

import AppDetails from "./about/AppDetails";

import styles from "./InstallAppPage.module.css";

const ANDROID_APP_BADGES = [
  {
    src: "/badges/play.svg",
    href: "https://play.google.com/store/apps/details?id=app.vger.voyager",
  },
  {
    src: "/badges/fdroid.png",
    href: "https://f-droid.org/en/packages/app.vger.voyager/",
  },
];

const IOS_APP_BADGES = [
  {
    src: "/badges/ios.svg",
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
        <div className={styles.badgeItem} key={src}>
          <a href={href} target="_blank" rel="noopener noreferrer">
            <img className={styles.badgeImg} src={src} />
          </a>
        </div>
      ))}
    </>
  );

  const howToGetAppTitle = (
    <h3 className={styles.h3}>
      {showInstallwebAppDirections && (
        <IonIcon
          icon={chevronBack}
          onClick={() => setShowInstallwebAppDirections(false)}
        />
      )}{" "}
      How to get the App
    </h3>
  );

  const badges = <div className={styles.badgeContainer}>{nativeBadges}</div>;
  const badgesWithWeb = (
    <div className={styles.badgeContainer}>
      {nativeBadges}
      <div className={styles.badgeItem}>
        <img
          className={styles.badgeImg}
          src="/badges/pwa.svg"
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
      </div>
    </div>
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
                Tap <IonIcon icon={getShareIcon()} color="primary" /> from the
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
              <span className={styles.installLink}>
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
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/settings" text="Settings" />
          </IonButtons>

          <IonTitle>Install</IonTitle>
        </IonToolbar>
      </AppHeader>
      <AppContent scrollY>
        <div className={styles.container}>
          <AppDetails />

          {renderGuidance()}
        </div>
      </AppContent>
    </IonPage>
  );
}
