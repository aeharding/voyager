import { IonBackButton, IonButtons, IonTitle, IonToolbar } from "@ionic/react";

import HidingSettings from "#/features/settings/general/hiding/HidingSettings";
import AppContent from "#/features/shared/AppContent";
import AppHeader from "#/features/shared/AppHeader";
import { AppPage } from "#/helpers/AppPage";

export default function HidingSettingsPage() {
  return (
    <AppPage>
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/settings/general" text="General" />
          </IonButtons>

          <IonTitle>Marking Read / Hiding</IonTitle>
        </IonToolbar>
      </AppHeader>
      <AppContent scrollY color="light-bg">
        <HidingSettings />
      </AppContent>
    </AppPage>
  );
}
