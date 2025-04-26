import { IonBackButton, IonButtons, IonTitle, IonToolbar } from "@ionic/react";

import SwipeSettings from "#/features/settings/gestures/SwipeSettings";
import AppContent from "#/features/shared/AppContent";
import AppHeader from "#/features/shared/AppHeader";
import { AppPage } from "#/helpers/AppPage";

export default function GesturesPage() {
  return (
    <AppPage>
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/settings" text="Settings" />
          </IonButtons>

          <IonTitle>Gestures</IonTitle>
        </IonToolbar>
      </AppHeader>
      <AppContent scrollY color="light-bg">
        <SwipeSettings />
      </AppContent>
    </AppPage>
  );
}
