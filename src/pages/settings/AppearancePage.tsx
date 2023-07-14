import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import AppContent from "../../features/shared/AppContent";
import TextSize from "../../features/settings/appearance/TextSize";
import PostView from "../../features/settings/appearance/PostView";
import DarkMode from "../../features/settings/appearance/DarkMode";
import CollapsedByDefault from "../../features/settings/appearance/CollapsedByDefault";
import CompactSettings from "../../features/settings/appearance/CompactSettings";

export default function AppearancePage() {
  return (
    <IonPage className="grey-bg">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/settings" text="Settings" />
          </IonButtons>

          <IonTitle>Appearance</IonTitle>
        </IonToolbar>
      </IonHeader>
      <AppContent scrollY>
        <TextSize />
        <CollapsedByDefault />
        <PostView />
        <CompactSettings />
        <DarkMode />
      </AppContent>
    </IonPage>
  );
}
