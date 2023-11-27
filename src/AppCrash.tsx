import styled from "@emotion/styled";
import { FallbackProps } from "react-error-boundary";
import { useLocation } from "react-router";
import { useAppSelector } from "./store";
import { jwtSelector } from "./features/auth/authSlice";
import { isInstalled, isNative } from "./helpers/device";
import { IonButton, IonContent, IonIcon, IonLabel } from "@ionic/react";
import { logoGithub } from "ionicons/icons";
import { unloadServiceWorkerAndRefresh } from "./helpers/serviceWorker";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
  padding: 8px;

  padding-top: max(env(safe-area-inset-top), 8px);
  padding-right: max(env(safe-area-inset-right), 8px);
  padding-bottom: max(env(safe-area-inset-bottom), 8px);
  padding-left: max(env(safe-area-inset-left), 8px);
`;

const Title = styled.h2``;

const Description = styled.div``;

export default function AppCrash({ error }: FallbackProps) {
  const location = useLocation();
  const loggedIn = !!useAppSelector(jwtSelector);

  const crashData = `
### Crash description

<!-- Write any information here to help us debug your crash! -->
<!-- What were you doing when the crash occurred? -->

### Device and app metadata

  - window.location.href: \`${window.location.href}\`
  - react-router location.pathname: \`${location.pathname}\`
  - Logged in? \`${loggedIn}\`
  - Native app? \`${isNative()}\`
  - Installed to home screen? \`${isInstalled()}\`
  - Voyager version: \`${APP_VERSION}\`
  - BUILD_FOSS_ONLY: \`${BUILD_FOSS_ONLY}\`
  - User agent: \`${navigator.userAgent}\`

### Crash data

Error: \`${error}\`

#### Stack trace

\`\`\`
${error instanceof Error ? error.stack : "Not available"}
\`\`\`
  `.trim();

  async function clearData() {
    if (
      !confirm(
        "Are you sure? This will log you out of all accounts and delete all local app data including app configuration, hidden posts and favorites.",
      )
    )
      return;

    localStorage.clear();
    sessionStorage.clear();

    const dbs = await window.indexedDB.databases();
    for (const db of dbs) {
      if (db.name) window.indexedDB.deleteDatabase(db.name);
    }

    alert("All data cleared.");
  }

  return (
    <IonContent>
      <Container>
        <Title>🫣 Gah! Voyager crashed!</Title>
        <Description>
          Voyager does not collect any data, so we would appreciate you
          voluntarily submitting this crash for us to investigate.
        </Description>
        <IonButton
          href={`https://github.com/aeharding/voyager/issues/new?title=Crash&body=${encodeURIComponent(
            crashData,
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          color="success"
        >
          <IonIcon icon={logoGithub} slot="start" />
          <IonLabel>Open Github issue with crash data</IonLabel>
        </IonButton>

        <hr />

        <Description>
          You can also try reloading the app to see if that solves the issue.
          {isNative() ? " Check the app store for an update, too." : ""}
        </Description>
        <IonButton onClick={unloadServiceWorkerAndRefresh}>
          Reload app
        </IonButton>

        <hr />

        <Description>
          If this crash is affecting many people, you can probably learn more{" "}
          <a
            href="https://lemmy.world/c/voyagerapp"
            target="_blank"
            rel="noopener noreferrer"
          >
            at Voyager&apos;s Lemmy community
          </a>
          .
        </Description>

        <Description>As a last resort, try clearing all app data.</Description>
        <IonButton color="danger" onClick={clearData}>
          Clear app data
        </IonButton>
      </Container>
    </IonContent>
  );
}
