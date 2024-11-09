import {
  IonBackButton,
  IonButtons,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useRef } from "react";
import { useParams } from "react-router";

import { useSetActivePage } from "#/features/auth/AppContext";
import MigrateSubsList from "#/features/migrate/MigrateSubsList";
import AppContent from "#/features/shared/AppContent";
import AppHeader from "#/features/shared/AppHeader";

export default function RedditMigrateSubsListPage() {
  const { link } = useParams<{ link: string }>();
  const pageRef = useRef<HTMLElement>(null);

  useSetActivePage(pageRef);

  return (
    <IonPage ref={pageRef} className="grey-bg">
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton
              defaultHref="/settings/reddit-migrate"
              text="Migrate"
            />
          </IonButtons>

          <IonTitle>Subreddits</IonTitle>
        </IonToolbar>
      </AppHeader>
      <AppContent scrollY>
        <MigrateSubsList link={link} />
      </AppContent>
    </IonPage>
  );
}
