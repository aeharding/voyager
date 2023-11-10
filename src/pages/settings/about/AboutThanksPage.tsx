import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import AppContent from "../../../features/shared/AppContent";
import { InsetIonItem } from "./AboutPage";
import InAppExternalLink from "../../../features/shared/InAppExternalLink";

const links = [
  {
    label: "Lemmy",
    href: "https://join-lemmy.org",
  },
  {
    label: "Ionic Framework",
    href: "https://ionicframework.com",
  },
  {
    label: "Capacitor",
    href: "https://capacitorjs.com",
  },
  {
    label: "Virtua",
    href: "https://github.com/inokawa/virtua",
  },
  {
    label: "Dexie",
    href: "https://dexie.org",
  },
  {
    label: "Vite",
    href: "https://vitejs.dev",
  },
  {
    label: "Emotion",
    href: "https://emotion.sh",
  },
  {
    label: "React",
    href: "https://react.dev",
  },
];

export default function AboutThanksPage() {
  return (
    <IonPage className="grey-bg">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton text="Settings" defaultHref="/settings/about" />
          </IonButtons>

          <IonTitle>Thanks To</IonTitle>
        </IonToolbar>
      </IonHeader>
      <AppContent scrollY fullscreen>
        <IonList inset color="primary">
          {links.map(({ label, href }) => (
            <InsetIonItem
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              detail
              key={label}
            >
              <IonLabel>{label}</IonLabel>
            </InsetIonItem>
          ))}
        </IonList>
        <p className="ion-padding-start">
          ...and all of Voyager&apos;s contributors! 💙
        </p>
        <InAppExternalLink
          href="https://github.com/aeharding/voyager/graphs/contributors"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="https://contrib.rocks/image?repo=aeharding/voyager"
            className="ion-padding-start ion-padding-end ion-padding-bottom"
          />
        </InAppExternalLink>
      </AppContent>
    </IonPage>
  );
}
