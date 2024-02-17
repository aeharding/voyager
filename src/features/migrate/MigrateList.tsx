import {
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  useIonAlert,
} from "@ionic/react";
import { InsetIonItem } from "../user/Profile";
import { useAppDispatch, useAppSelector } from "../../store";
import { useEffect } from "react";
import {
  addMigrationLink,
  getMigrationLinks,
  removeMigrationLink,
} from "./migrationSlice";
import { getPathname, isValidUrl } from "../../helpers/url";
import { parseSubsFromLink } from "./MigrateSubsList";
import useAppToast from "../../helpers/useAppToast";
import { migrateParseError } from "../../helpers/toastMessages";

export default function MigrateList() {
  const dispatch = useAppDispatch();
  const links = useAppSelector((state) => state.migration.links);
  const presentToast = useAppToast();
  const [presentAlert] = useIonAlert();

  useEffect(() => {
    dispatch(getMigrationLinks());
  });

  function remove(link: string) {
    dispatch(removeMigrationLink(link));
  }

  function add() {
    presentAlert({
      message: "Paste Multireddit Link",
      buttons: [
        {
          text: "OK",
          handler: ({ link }) => {
            if (
              !isValidUrl(link, { checkProtocol: true, allowRelative: false })
            ) {
              presentToast(migrateParseError);
              return;
            }

            const subs = parseSubsFromLink(link);

            if (!subs.length) {
              presentToast(migrateParseError);
              return;
            }

            dispatch(addMigrationLink(link));
          },
        },
        "Cancel",
      ],
      inputs: [
        {
          placeholder: "Multireddit link",
          name: "link",
        },
      ],
    });
  }

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
        {links.map((link) => (
          <IonItemSliding key={link}>
            <IonItemOptions side="end" onIonSwipe={() => remove(link)}>
              <IonItemOption
                color="danger"
                expandable
                onClick={() => remove(link)}
              >
                Forget
              </IonItemOption>
            </IonItemOptions>
            <InsetIonItem
              routerLink={`/settings/reddit-migrate/${encodeURIComponent(link)}`}
            >
              <IonLabel class="ion-text-nowrap">{getPathname(link)}</IonLabel>
            </InsetIonItem>
          </IonItemSliding>
        ))}
        <IonItemSliding>
          <InsetIonItem onClick={() => add()}>
            <IonLabel color="primary">Add multireddit link</IonLabel>
          </InsetIonItem>
        </IonItemSliding>
      </IonList>
    </>
  );
}
