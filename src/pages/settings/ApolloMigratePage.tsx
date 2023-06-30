import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonToast,
} from "@ionic/react";
import AppContent from "../../features/shared/AppContent";
import { flatten, identity, sortBy, uniq } from "lodash";
import { useState } from "react";
import { notEmpty } from "../../helpers/array";
import { InsetIonItem } from "../profile/ProfileFeedItemsPage";
import { css } from "@emotion/react";

export default function ApolloMigratePage() {
  const [present] = useIonToast();
  const [subs, setSubs] = useState<string[] | undefined>();

  function renderUpload() {
    return (
      <>
        <div className="ion-padding">
          <p>
            This tool is designed for Apollo users migrating to Lemmy. Upload
            your export to easily search for your Reddit subs with a similar
            name.
          </p>
          <ul>
            <li>Update Apollo to the latest version</li>
            <li>Visit Settings Tab</li>
            <li>Tab &quot;Export&quot; in header</li>
            <li>Select JSON</li>
            <li>Download, then come back to wefwef and upload below</li>
          </ul>
        </div>
        <IonList inset>
          <label htmlFor="upload-apollo">
            <InsetIonItem detail>
              <IonLabel>Upload JSON file</IonLabel>
              <input
                id="upload-apollo"
                css={css`
                  display: none;
                `}
                type="file"
                accept=".json"
                onInput={async (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (!file) return;

                  let potentialSubs;

                  try {
                    potentialSubs = await getSubreddits(file);
                    if (!potentialSubs.length) throw new Error("empty");
                  } catch (error) {
                    present({
                      message: "Hmmmm. That file doesn't look right.",
                      duration: 3500,
                      position: "bottom",
                      color: "danger",
                    });
                  }

                  setSubs(potentialSubs);
                }}
              />
            </InsetIonItem>
          </label>
        </IonList>
      </>
    );
  }

  function renderSubs() {
    return (
      <IonList>
        {subs?.map((sub) => (
          <IonItem key={sub} routerLink={`/settings/apollo-migrate/${sub}`}>
            r/{sub}
          </IonItem>
        ))}
      </IonList>
    );
  }

  return (
    <IonPage className="grey-bg">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/settings" text="Settings" />
          </IonButtons>

          <IonTitle>Migrate</IonTitle>
        </IonToolbar>
      </IonHeader>
      <AppContent scrollY>{!subs ? renderUpload() : renderSubs()}</AppContent>
    </IonPage>
  );
}

interface ApolloUserData {
  subscribed_subreddits: string[];
  favorites: string[];
}

async function getSubreddits(file: File): Promise<string[]> {
  const dataByUser = Object.values(
    await convertFileToJson(file)
  ) as ApolloUserData[];

  return sortBy(
    uniq(
      flatten(
        dataByUser
          .map((user) => user.subscribed_subreddits)
          .concat(dataByUser.map((user) => user.favorites))
      )
    ).filter(notEmpty),
    identity
  );
}

function convertFileToJson(file: File): Promise<never> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        resolve(json);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (event: ProgressEvent<FileReader>) => {
      reject(event.target?.error);
    };

    reader.readAsText(file);
  });
}
