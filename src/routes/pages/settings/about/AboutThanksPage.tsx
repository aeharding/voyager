import {
  IonBackButton,
  IonButtons,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useRef } from "react";

import { useSetActivePage } from "#/features/auth/AppContext";
import AppContent from "#/features/shared/AppContent";
import AppHeader from "#/features/shared/AppHeader";
import InAppExternalLink, {
  IonItemInAppExternalLink,
} from "#/features/shared/InAppExternalLink";

const links = [
  {
    label: "Apollo",
    href: "https://apolloapp.io",
  },
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
    label: "React",
    href: "https://react.dev",
  },
  {
    label: "Lemmy Explorer",
    href: "https://lemmyverse.net",
  },
];

export default function AboutThanksPage() {
  const pageRef = useRef<HTMLElement>(null);

  useSetActivePage(pageRef);

  return (
    <IonPage className="grey-bg" ref={pageRef}>
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton text="Settings" defaultHref="/settings/about" />
          </IonButtons>

          <IonTitle>Thanks To</IonTitle>
        </IonToolbar>
      </AppHeader>
      <AppContent scrollY fullscreen>
        <IonList inset color="primary">
          {links.map(({ label, href }) => (
            <IonItemInAppExternalLink
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              detail
              key={label}
            >
              <IonLabel>{label}</IonLabel>
            </IonItemInAppExternalLink>
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
