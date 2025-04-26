import { IonBackButton, IonButtons, IonTitle, IonToolbar } from "@ionic/react";

import SelectDeviceMode from "#/features/settings/appearance/themes/system/SelectDeviceMode";
import AppContent from "#/features/shared/AppContent";
import AppHeader from "#/features/shared/AppHeader";
import { AppPage } from "#/helpers/AppPage";

export default function DeviceModeSettingsPage() {
  return (
    <AppPage>
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton
              defaultHref="/settings/appearance/theme"
              text="Theme"
            />
          </IonButtons>

          <IonTitle>Device Mode</IonTitle>
        </IonToolbar>
      </AppHeader>
      <AppContent scrollY color="light-bg">
        <SelectDeviceMode />
      </AppContent>
    </AppPage>
  );
}
