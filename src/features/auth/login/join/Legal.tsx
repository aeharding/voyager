import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonItem,
  IonList,
  IonNavLink,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";

import AppHeader from "#/features/shared/AppHeader";
import { useInterceptHrefWithInAppBrowserIfNeeded } from "#/features/shared/InAppExternalLink";
import Markdown from "#/features/shared/markdown/Markdown";
import { VOYAGER_PRIVACY, VOYAGER_TERMS } from "#/helpers/voyager";
import { useAppSelector } from "#/store";

import Join from "./Join";
import Question from "./Question";

export default function Legal() {
  const { url, site } = useAppSelector((state) => state.join);
  const interceptHrefWithInAppBrowserIfNeeded =
    useInterceptHrefWithInAppBrowserIfNeeded();

  return (
    <>
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>Privacy &amp; Terms</IonTitle>
          <IonButtons slot="end">
            <IonNavLink
              component={() => {
                if (
                  site?.site_view.local_site.application_question &&
                  site?.site_view.local_site.registration_mode ===
                    "RequireApplication"
                )
                  return <Question />;

                return <Join />;
              }}
            >
              <IonButton strong>I Agree</IonButton>
            </IonNavLink>
          </IonButtons>
        </IonToolbar>
      </AppHeader>
      <IonContent>
        <AppHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Privacy &amp; Terms</IonTitle>
          </IonToolbar>
        </AppHeader>

        <p className="ion-padding">
          The Voyager app does not collect any data, but the server you sign up
          with may have a different policy. Take a moment to review and agree to
          the Voyager App policies as well as your server&apos;s policies.
        </p>

        <IonList inset>
          <IonItem
            href={VOYAGER_PRIVACY}
            target="_blank"
            rel="noopener noreferrer"
            onClick={interceptHrefWithInAppBrowserIfNeeded(VOYAGER_PRIVACY)}
          >
            Voyager App — Privacy Policy
          </IonItem>
          <IonItem
            href={VOYAGER_TERMS}
            target="_blank"
            rel="noopener noreferrer"
            onClick={interceptHrefWithInAppBrowserIfNeeded(VOYAGER_TERMS)}
          >
            Voyager App — Terms of Use
          </IonItem>
        </IonList>

        <p className="ion-padding">
          The server {url} has the following legal information below:
        </p>

        <IonList inset className="ion-padding">
          {site?.site_view.local_site.legal_information?.trim() ? (
            <Markdown
              className="collapse-md-margins"
              id={`site-legal-${site?.site_view.site.actor_id}`}
            >
              {site.site_view.local_site.legal_information}
            </Markdown>
          ) : (
            <IonText color="medium">
              <i>This server ({url}) does not have any terms set up.</i>
            </IonText>
          )}
        </IonList>
      </IonContent>
    </>
  );
}
