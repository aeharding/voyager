import { IonBackButton, IonButtons, IonTitle, IonToolbar } from "@ionic/react";
import { useParams } from "react-router";

import MigrateSubsList from "#/features/migrate/MigrateSubsList";
import AppContent from "#/features/shared/AppContent";
import AppHeader from "#/features/shared/AppHeader";
import { AppPage } from "#/helpers/AppPage";

export default function RedditMigrateSubsListPage() {
  const { link } = useParams<{ link: string }>();

  return (
    <AppPage>
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
      <AppContent scrollY color="light-bg">
        <MigrateSubsList link={link} />
      </AppContent>
    </AppPage>
  );
}
