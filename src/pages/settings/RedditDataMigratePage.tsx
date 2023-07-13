import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonToast,
} from "@ionic/react";
import AppContent from "../../features/shared/AppContent";
import { useEffect, useState } from "react";
import { InsetIonItem } from "../profile/ProfileFeedItemsPage";
import { isValidUrl } from "../../helpers/url";

export default function RedditMigratePage() {
  const [present] = useIonToast();
  const [subs, setSubs] = useState<string[] | undefined>();
  const [link, setLink] = useState("");

  useEffect(() => {
    if (!isValidUrl(link)) return;

    const subs = parseSubsFromLink(link);

    if (!subs.length) {
      present({
        message:
          "Problem parsing link. Please make sure the link you entered is correct.",
        duration: 3500,
        position: "bottom",
        color: "danger",
      });
      setLink("");
      return;
    }

    setSubs(subs);
  }, [link, present]);

  function renderUpload() {
    return (
      <>
        <div className="ion-padding">
          <p>
            This tool is designed for Reddit users migrating to Lemmy to easily
            search for communities similar to subscribed subreddits.
          </p>
          <ul>
            <li>
              Visit{" "}
              <a
                href="https://www.reddit.com/subreddits/"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://www.reddit.com/subreddits
              </a>
            </li>
            <li>If iOS, open in Safari so you can copy links to clipboard</li>
            <li>Login</li>
            <li>
              Copy the link for &quot;multireddit of your subscriptions&quot; in
              the sidebar
            </li>
            <li>Paste below</li>
          </ul>
        </div>
        <IonList inset>
          <label htmlFor="upload-csv">
            <InsetIonItem>
              <IonLabel>Paste multireddit link</IonLabel>

              <IonInput
                label="Multireddit link"
                type="text"
                value={link}
                onIonInput={(e) => setLink(e.target.value as string)}
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

function parseSubsFromLink(multiredditUrl: string) {
  const { pathname } = new URL(multiredditUrl);

  if (!pathname.startsWith("/r/")) return [];

  return pathname.slice(3).split("+");
}
