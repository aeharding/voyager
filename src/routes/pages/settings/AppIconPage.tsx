import { IonBackButton, IonButtons, IonTitle, IonToolbar } from "@ionic/react";

import AppIcon from "#/features/settings/appIcon/AppIcon";
import AppContent from "#/features/shared/AppContent";
import AppHeader from "#/features/shared/AppHeader";
import { AppPage } from "#/helpers/AppPage";

export default function AppIconPage() {
  return (
    <AppPage>
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/settings" text="Settings" />
          </IonButtons>

          <IonTitle>App Icon</IonTitle>
        </IonToolbar>
      </AppHeader>
      <AppContent scrollY color="light-bg">
        <AppIcon />
      </AppContent>
    </AppPage>
  );
}
