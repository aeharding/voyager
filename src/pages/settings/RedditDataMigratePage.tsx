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
import { useState } from "react";
import { InsetIonItem } from "../profile/ProfileFeedItemsPage";
import { css } from "@emotion/react";

export default function RedditMigratePage() {
  const [present] = useIonToast();
  const [subs, setSubs] = useState<string[] | undefined>();

  function renderUpload() {
    return (
      <>
        <div className="ion-padding">
          <p>
            This tool is designed for Reddit users migrating to Lemmy. Upload
            your export to easily search for your Reddit subs with a similar
            name.
          </p>
          <ul>
            <li>
              Request a{" "}
              <a href="https://www.reddit.com/settings/data-request">
                full export of your user data from reddit
              </a>
              .
            </li>
            <li>
              Note this may take several weeks, and you can only submit one
              request every 30 days.
            </li>
            <li>You will be notified via DM once it is complete.</li>
            <li>Download zip archive of CSV files with your user data</li>
            <li>
              Unzip, then come back to wefwef and upload the file
              `subscribed_subreddits.csv` below
            </li>
          </ul>
        </div>
        <IonList inset>
          <label htmlFor="upload-csv">
            <InsetIonItem detail>
              <IonLabel>Upload CSV file</IonLabel>
              <input
                id="upload-csv"
                css={css`
                  display: none;
                `}
                type="file"
                accept=".csv"
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
          <IonItem key={sub} routerLink={`/settings/reddit-migrate/${sub}`}>
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

async function getSubreddits(file: File): Promise<string[]> {
  const subreddits = (await parseFile(file)) as string[];
  return subreddits;
}

function parseFile(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      try {
        const csv_raw = event.target?.result as string;
        const split = csv_raw.split(/\r\n|\n/);
        const header = split.shift();
        // First entry should say "subreddit"
        if (header !== "subreddit") {
          reject("Invalid CSV");
        }
        resolve(split);
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
