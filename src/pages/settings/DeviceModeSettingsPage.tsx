import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import AppContent from "../../features/shared/AppContent";
import SelectDeviceMode from "../../features/settings/appearance/themes/system/SelectDeviceMode";

export default function DeviceModeSettingsPage() {
  return (
    <IonPage className="grey-bg">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton
              defaultHref="/settings/appearance"
              text="Appearance"
            />
          </IonButtons>

          <IonTitle>Device Mode</IonTitle>
        </IonToolbar>
      </IonHeader>
      <AppContent scrollY>
        <SelectDeviceMode />
      </AppContent>
    </IonPage>
  );
}
