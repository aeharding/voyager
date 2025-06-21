import { IonBackButton, IonButtons, IonTitle, IonToolbar } from "@ionic/react";

import Theme from "#/features/settings/appearance/themes/Theme";
import AppContent from "#/features/shared/AppContent";
import AppHeader from "#/features/shared/AppHeader";
import { AppPage } from "#/helpers/AppPage";

export default function AppearanceThemePage() {
  return (
    <AppPage>
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/settings" text="Settings" />
          </IonButtons>

          <IonTitle>Theme</IonTitle>
        </IonToolbar>
      </AppHeader>
      <AppContent scrollY color="light-bg">
        <Theme />
      </AppContent>
    </AppPage>
  );
}
