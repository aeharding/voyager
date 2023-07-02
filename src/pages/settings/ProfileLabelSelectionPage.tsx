import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import AppContent from "../../features/shared/AppContent";
import ProfileLabelSelection from "../../features/settings/appearance/profile/profileLabelSelection";

export default function ProfileLabelSelectionPage() {
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

          <IonTitle>Profile label</IonTitle>
        </IonToolbar>
      </IonHeader>
      <AppContent scrollY>
        <ProfileLabelSelection />
      </AppContent>
    </IonPage>
  );
}
