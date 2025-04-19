import { IonBackButton, IonButtons, IonTitle, IonToolbar } from "@ionic/react";

import GeneralSettings from "#/features/settings/general/GeneralSettings";
import AppContent from "#/features/shared/AppContent";
import AppHeader from "#/features/shared/AppHeader";
import { AppPage } from "#/helpers/AppPage";

export default function GeneralPage() {
  return (
    <AppPage>
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/settings" text="Settings" />
          </IonButtons>

          <IonTitle>General</IonTitle>
        </IonToolbar>
      </AppHeader>
      <AppContent scrollY color="light-bg">
        <GeneralSettings />
      </AppContent>
    </AppPage>
  );
}
