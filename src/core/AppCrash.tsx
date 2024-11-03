import { IonButton, IonIcon, IonLabel } from "@ionic/react";
import { styled } from "@linaria/react";
import { logoGithub } from "ionicons/icons";
import { FallbackProps } from "react-error-boundary";

import { loggedInSelector } from "#/features/auth/authSelectors";
import { isInstalled, isNative } from "#/helpers/device";
import { unloadServiceWorkerAndRefresh } from "#/helpers/serviceWorker";
import { memoryHistory } from "#/routes/common/Router";
import store from "#/store";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
  padding: 8px;

  position: absolute;
  inset: 0;

  overflow: auto;

  padding-top: max(env(safe-area-inset-top), 8px);
  padding-right: max(env(safe-area-inset-right), 8px);
  padding-bottom: max(env(safe-area-inset-bottom), 8px);
  padding-left: max(env(safe-area-inset-left), 8px);

  color: var(--ion-text-color);
`;

const Title = styled.h2``;

const Description = styled.div``;

export default function AppCrash({ error }: FallbackProps) {
  // Don't use useLocation/useAppSelector, because they are not available
  // (`<AppCrash />` is at the root of the document tree)
  const location = memoryHistory ? memoryHistory.location : window.location;
  const loggedIn = loggedInSelector(store.getState());

  let crashData = `
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

Error: \`\`${error}\`\`

#### Stack trace

\`\`\`
  `.trim();

  crashData = `${crashData}\n${error instanceof Error ? error.stack : "Not available"}`;

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
    <Container>
      <Title>🫣 Gah! Voyager crashed!</Title>
      <Description>
        Voyager does not collect any data, so we would appreciate you
        voluntarily submitting this crash for us to investigate.
      </Description>
      <IonButton
        href={generateTruncatedCrashUrl(crashData)}
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
      <IonButton onClick={unloadServiceWorkerAndRefresh}>Reload app</IonButton>

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
  );
}

function generateCrashUrl(crashData: string): string {
  return `https://github.com/aeharding/voyager/issues/new?title=Crash&body=${encodeURIComponent(
    crashData,
  )}`;
}

// The GitHub GET endpoint for opening a new issue
// has a restriction for maximum length of a URL: 8192 bytes
// https://github.com/cli/cli/pull/3271
// https://github.com/cli/cli/issues/1575
// https://github.com/cli/cli/blob/trunk/pkg/cmd/issue/create/create.go#L167
// https://github.com/cli/cli/blob/trunk/utils/utils.go#L84
const maxIssueBytes = 8150;

function getStrByteLength(str: string): number {
  return new TextEncoder().encode(str).length;
}

function generateTruncatedCrashUrl(crashData: string): string {
  let url: string;
  let strLength = 1;

  do {
    url = generateCrashUrl(crashData.slice(0, strLength));
    if (strLength === crashData.length) return url;
    strLength++;
  } while (getStrByteLength(url) < maxIssueBytes);

  return url;
}
