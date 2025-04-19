import { IonBackButton, IonButtons, IonTitle, IonToolbar } from "@ionic/react";

import AppearanceSettings from "#/features/settings/appearance/AppearanceSettings";
import AppContent from "#/features/shared/AppContent";
import AppHeader from "#/features/shared/AppHeader";
import { AppPage } from "#/helpers/AppPage";

export default function AppearancePage() {
  return (
    <AppPage>
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/settings" text="Settings" />
          </IonButtons>

          <IonTitle>Appearance</IonTitle>
        </IonToolbar>
      </AppHeader>
      <AppContent scrollY color="light-bg">
        <AppearanceSettings />
      </AppContent>
    </AppPage>
  );
}
