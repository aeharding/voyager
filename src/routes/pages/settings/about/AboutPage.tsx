import {
  IonBackButton,
  IonButtons,
  IonIcon,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { shuffle } from "es-toolkit";
import {
  bug,
  handLeft,
  happy,
  heart,
  lockClosed,
  logoMastodon,
  people,
  sparkles,
  thumbsUp,
} from "ionicons/icons";
import { useRef } from "react";

import { useSetActivePage } from "#/features/auth/AppContext";
import AppContent from "#/features/shared/AppContent";
import AppHeader from "#/features/shared/AppHeader";
import { IonItemInAppExternalLink } from "#/features/shared/InAppExternalLink";
import { isAndroid, isNative } from "#/helpers/device";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import useAppToast from "#/helpers/useAppToast";
import { VOYAGER_PRIVACY, VOYAGER_TERMS } from "#/helpers/voyager";
import { useAppSelector } from "#/store";

import { IconBg } from "../SettingsPage";
import AppDetails from "./AppDetails";
import compliments from "./compliments.txt?raw";

export default function AboutPage() {
  const pageRef = useRef<HTMLElement>(null);

  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );
  const presentToast = useAppToast();

  const messages = useRef(shuffle(compliments.split("\n")));
  const messageIndex = useRef(0);

  const appCommunityHandle =
    connectedInstance === "lemmy.world"
      ? "voyagerapp"
      : "voyagerapp@lemmy.world";

  function getCompliment() {
    presentToast({
      message: messages.current[messageIndex.current]!,
      color: "success",
      centerText: true,
    });
    messageIndex.current = (messageIndex.current + 1) % messages.current.length;
  }

  const rateVoyager = (() => {
    if (!isNative()) return;

    const href = isAndroid()
      ? "https://play.google.com/store/apps/details?id=app.vger.voyager"
      : "https://apps.apple.com/app/id6451429762?action=write-review";

    return (
      <IonItemInAppExternalLink
        detail
        href={href}
        target="_blank"
        rel="noopener noreferrer"
      >
        <IconBg color="color(display-p3 1 0 0)" slot="start">
          <IonIcon icon={heart} />
        </IconBg>
        <IonLabel>Rate Voyager</IonLabel>
      </IonItemInAppExternalLink>
    );
  })();

  useSetActivePage(pageRef);

  return (
    <IonPage ref={pageRef} className="grey-bg">
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton text="Settings" defaultHref="/settings" />
          </IonButtons>

          <IonTitle>About</IonTitle>
        </IonToolbar>
      </AppHeader>
      <AppContent scrollY fullscreen>
        <AppDetails />

        <IonList inset color="primary">
          <IonItemInAppExternalLink
            href="https://github.com/aeharding/voyager/releases"
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconBg color="color(display-p3 0.7 0 1)" size="0.8" slot="start">
              <IonIcon icon={sparkles} />
            </IconBg>
            <IonLabel>What&apos;s new</IonLabel>
          </IonItemInAppExternalLink>
          <IonItemInAppExternalLink
            routerLink={buildGeneralBrowseLink(`/c/${appCommunityHandle}`)}
            detail
          >
            <IconBg color="color(display-p3 0 0.8 0.3)" slot="start">
              <IonIcon icon={people} />
            </IconBg>
            <IonLabel>VoyagerApp Community</IonLabel>
          </IonItemInAppExternalLink>
          <IonItemInAppExternalLink
            detail
            href="https://social.harding.dev/@alex"
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconBg color="#563acc" slot="start">
              <IonIcon icon={logoMastodon} />
            </IconBg>
            <IonLabel>@alex@harding.dev</IonLabel>
          </IonItemInAppExternalLink>
          <IonItemInAppExternalLink
            detail
            href={VOYAGER_PRIVACY}
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconBg color="#0e7afe" slot="start">
              <IonIcon icon={lockClosed} />
            </IconBg>
            <IonLabel>Privacy Policy</IonLabel>
          </IonItemInAppExternalLink>
          <IonItemInAppExternalLink
            detail
            href={VOYAGER_TERMS}
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconBg color="#8e8700" slot="start">
              <IonIcon icon={handLeft} />
            </IconBg>
            <IonLabel>Terms of Use</IonLabel>
          </IonItemInAppExternalLink>
          {rateVoyager}
          <IonItemInAppExternalLink detail routerLink="/settings/about/thanks">
            <IconBg color="color(display-p3 0.1 0.6 0.1)" slot="start">
              <IonIcon icon={thumbsUp} />
            </IconBg>
            <IonLabel>Thanks To</IonLabel>
          </IonItemInAppExternalLink>
          <IonItemInAppExternalLink
            detail
            href="https://github.com/aeharding/voyager/issues"
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconBg color="color(display-p3 0.5 0.7 0.1)" slot="start">
              <IonIcon icon={bug} />
            </IconBg>
            <IonLabel>Bug Tracker</IonLabel>
          </IonItemInAppExternalLink>
          <IonItemInAppExternalLink detail onClick={getCompliment}>
            <IconBg color="color(display-p3 1 0.1 0.6)" size="1.1" slot="start">
              <IonIcon icon={happy} />
            </IconBg>
            <IonLabel>Get a Compliment</IonLabel>
          </IonItemInAppExternalLink>
        </IonList>
      </AppContent>
    </IonPage>
  );
}
