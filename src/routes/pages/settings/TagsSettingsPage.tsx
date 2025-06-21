import { IonBackButton, IonButtons, IonTitle, IonToolbar } from "@ionic/react";

import TagsSettings from "#/features/settings/tags/TagsSettings";
import AppContent from "#/features/shared/AppContent";
import AppHeader from "#/features/shared/AppHeader";
import { AppPage } from "#/helpers/AppPage";

export default function TagsSettingsPage() {
  return (
    <AppPage>
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton text="Settings" defaultHref="/settings" />
          </IonButtons>

          <IonTitle>User Tags</IonTitle>
        </IonToolbar>
      </AppHeader>
      <AppContent scrollY fullscreen color="light-bg">
        <TagsSettings />
      </AppContent>
    </AppPage>
  );
}
