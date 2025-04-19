import { IonBackButton, IonButtons, IonTitle, IonToolbar } from "@ionic/react";

import BiometricSettings from "#/features/settings/biometric/BiometricSettings";
import BiometricTitle from "#/features/settings/biometric/BiometricTitle";
import AppContent from "#/features/shared/AppContent";
import AppHeader from "#/features/shared/AppHeader";
import { AppPage } from "#/helpers/AppPage";

export default function BiometricPage() {
  return (
    <AppPage>
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton text="Settings" defaultHref="/settings" />
          </IonButtons>

          <IonTitle>
            <BiometricTitle />
          </IonTitle>
        </IonToolbar>
      </AppHeader>
      <AppContent scrollY fullscreen color="light-bg">
        <BiometricSettings />
      </AppContent>
    </AppPage>
  );
}
