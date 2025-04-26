import { IonBackButton, IonButtons, IonTitle, IonToolbar } from "@ionic/react";

import MigrateList from "#/features/migrate/MigrateList";
import AppContent from "#/features/shared/AppContent";
import AppHeader from "#/features/shared/AppHeader";
import { AppPage } from "#/helpers/AppPage";

export default function RedditMigratePage() {
  return (
    <AppPage>
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/settings" text="Settings" />
          </IonButtons>

          <IonTitle>Migrate</IonTitle>
        </IonToolbar>
      </AppHeader>
      <AppContent scrollY color="light-bg">
        <MigrateList />
      </AppContent>
    </AppPage>
  );
}
