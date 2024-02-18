import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonIcon,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useBuildGeneralBrowseLink } from "../../../../helpers/routes";
import AppDetails from "./AppDetails";
import { SettingLabel } from "../../../../features/user/Profile";
import { IconBg } from "../SettingsPage";
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
import { useAppSelector } from "../../../../store";
import compliments from "./compliments.txt?raw";
import { shuffle } from "lodash";
import useAppToast from "../../../../helpers/useAppToast";
import { useRef } from "react";
import AppContent from "../../../../features/shared/AppContent";
import { IonItemInAppExternalLink } from "../../../../features/shared/InAppExternalLink";
import { isAndroid, isNative } from "../../../../helpers/device";
import { useSetActivePage } from "../../../../features/auth/AppContext";
import { VOYAGER_PRIVACY, VOYAGER_TERMS } from "../../../../helpers/voyager";
import { styled } from "@linaria/react";

export const InsetIonItem = styled(IonItemInAppExternalLink)`
  --background: var(--ion-tab-bar-background, var(--ion-color-step-50, #fff));
`;

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
      <InsetIonItem
        detail
        href={href}
        target="_blank"
        rel="noopener noreferrer"
      >
        <IconBg color="color(display-p3 1 0 0)">
          <IonIcon icon={heart} />
        </IconBg>
        <SettingLabel>Rate Voyager</SettingLabel>
      </InsetIonItem>
    );
  })();

  useSetActivePage(pageRef);

  return (
    <IonPage className="grey-bg" ref={pageRef}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton text="Settings" defaultHref="/settings" />
          </IonButtons>

          <IonTitle>About</IonTitle>
        </IonToolbar>
      </IonHeader>
      <AppContent scrollY fullscreen>
        <AppDetails />

        <IonList inset color="primary">
          <InsetIonItem
            href="https://github.com/aeharding/voyager/releases"
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconBg color="color(display-p3 0.7 0 1)" size="0.8">
              <IonIcon icon={sparkles} />
            </IconBg>
            <SettingLabel>What&apos;s new</SettingLabel>
          </InsetIonItem>
          <InsetIonItem
            routerLink={buildGeneralBrowseLink(`/c/${appCommunityHandle}`)}
            detail
          >
            <IconBg color="color(display-p3 0 0.8 0.3)">
              <IonIcon icon={people} />
            </IconBg>
            <SettingLabel>VoyagerApp Community</SettingLabel>
          </InsetIonItem>
          <InsetIonItem
            detail
            href="https://social.harding.dev/@alex"
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconBg color="#563acc">
              <IonIcon icon={logoMastodon} />
            </IconBg>
            <SettingLabel>@alex@harding.dev</SettingLabel>
          </InsetIonItem>
          <InsetIonItem
            detail
            href={VOYAGER_PRIVACY}
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconBg color="#0e7afe">
              <IonIcon icon={lockClosed} />
            </IconBg>
            <SettingLabel>Privacy Policy</SettingLabel>
          </InsetIonItem>
          <InsetIonItem
            detail
            href={VOYAGER_TERMS}
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconBg color="#8e8700">
              <IonIcon icon={handLeft} />
            </IconBg>
            <SettingLabel>Terms of Use</SettingLabel>
          </InsetIonItem>
          {rateVoyager}
          <InsetIonItem detail routerLink="/settings/about/thanks">
            <IconBg color="color(display-p3 0.1 0.6 0.1)">
              <IonIcon icon={thumbsUp} />
            </IconBg>
            <SettingLabel>Thanks To</SettingLabel>
          </InsetIonItem>
          <InsetIonItem
            detail
            href="https://github.com/aeharding/voyager/issues"
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconBg color="color(display-p3 0.5 0.7 0.1)">
              <IonIcon icon={bug} />
            </IconBg>
            <SettingLabel>Bug Tracker</SettingLabel>
          </InsetIonItem>
          <InsetIonItem detail onClick={getCompliment}>
            <IconBg color="color(display-p3 1 0.1 0.6)" size="1.1">
              <IonIcon icon={happy} />
            </IconBg>
            <SettingLabel>Get a Compliment</SettingLabel>
          </InsetIonItem>
        </IonList>
      </AppContent>
    </IonPage>
  );
}
